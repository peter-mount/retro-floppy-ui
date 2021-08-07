package api

import (
	"github.com/peter-mount/floppyui/server/ws"
	"github.com/peter-mount/go-kernel/rest"
	"strconv"
	"strings"
)

// createVolume creates a new volume
func (a *Api) volumeCreate(r *rest.Rest) error {
	volumeName := r.Var("volume")

	// Size is in MB
	sizeVar := r.Var("size")
	sizeModifier := 1
	if strings.HasSuffix(sizeVar, "m") {
		sizeModifier = 1
		sizeVar = sizeVar[:len(sizeVar)-1]
	} else if strings.HasSuffix(sizeVar, "g") {
		sizeModifier = 1024
		sizeVar = sizeVar[:len(sizeVar)-1]
	}
	size, err := strconv.Atoi(sizeVar)
	if err != nil {
		ws.Printf("Invalid volume size \"%s\": %s", sizeVar, err)
		return err
	}
	size = size * sizeModifier

	volume := a.vm.GetVolume(volumeName)
	if volume != nil {
		r.Status(409).Value("Already exists")
		return nil
	}

	volume = a.vm.NewVolume(volumeName)

	a.systemRun("Creating volume",
		"Creating new volume "+volume.Name(),
		systemTask{
			Title: "Creating backing store",
			Task: []string{
				"dd",
				"bs=1M",
				"if=/dev/zero",
				"of=" + volume.Volume(),
				"count=" + strconv.Itoa(int(size)),
			},
		},
		systemTask{
			Title: "Formatting",
			Task: []string{
				"mkdosfs",
				volume.Volume(),
				"-F", "32",
				"-I",
			},
		},
		systemTask{
			Title: "Mounting",
			Hook: func() error {
				err := a.vm.AddVolume(volumeName)
				if err == nil {
					// Notify UI of new volume
					_ = a.ws.Broadcast(ws.Message{
						ID:     "newVolume",
						Volume: volumeName,
					})
					// Open explorer on the new volume
					_ = a.ws.Broadcast(ws.Message{
						ID:     "exploreVolume",
						Volume: volumeName,
					})
				}
				return err
			},
		},
	)

	r.Status(200)
	return nil
}
