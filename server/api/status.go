package api

import (
	"github.com/peter-mount/floppyui/server/volume"
	"github.com/peter-mount/go-kernel/rest"
	"golang.org/x/sys/unix"
	"os"
)

type Status struct {
	Host Host                     `json:"host"`
	Disk map[string]unix.Statfs_t `json:"disk"`
}

type Host struct {
	Hostname string `json:"hostname"`
	Title    string `json:"title"`
	Computer string `json:"computer"`
}

func (a *Api) getStatus(r *rest.Rest) error {

	hostname, _ := os.Hostname()
	response := Status{
		Host: Host{
			Hostname: hostname,
			Title:    "",
			Computer: "",
		},
		Disk: make(map[string]unix.Statfs_t),
	}

	err := a.vm.ForEach(func(volume *volume.Volume) error {
		var s unix.Statfs_t
		err := volume.Statfs(&s)
		if err == nil {
			//      response.Disk[volume.Config.Name] = s
		}
		return err
	})
	if err != nil {
		return err
	}

	r.Status(200).
		JSON().
		Value(&response)

	return nil
}
