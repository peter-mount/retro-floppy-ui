package api

import (
	"github.com/peter-mount/go-kernel/rest"
	"github.com/peter-mount/retro-floppy-ui/server/volume"
	"golang.org/x/sys/unix"
)

type volumeList struct {
	Mounted string                   `json:"mounted"` // The mounted volume so visible on the GoTek
	File    string                   `json:"file"`    // The mounted disk on the GoTek
	Volumes map[string]unix.Statfs_t `json:"volumes"` // Map of volumes & their capacities
}

// listVolumes lists all available volumes, which one is currently mounted on the GoTek & which disk is loaded.
func (a *Api) listVolumes(r *rest.Rest) error {

	volumeList := volumeList{
		Mounted: a.gotek.Mounted(),
		Volumes: make(map[string]unix.Statfs_t),
	}

	vol := a.vm.GetVolume(volumeList.Mounted)
	if vol != nil {
		volumeList.File = vol.SelectedFile()
	}

	err := a.vm.ForEach(func(volume *volume.Volume) error {
		var s unix.Statfs_t
		err := volume.Statfs(&s)
		if err == nil {
			volumeList.Volumes[volume.Name()] = s
		}
		return err
	})
	if err != nil {
		return err
	}

	r.Status(200).
		JSON().
		Value(volumeList)
	return nil
}

// mountVolume mounts a volume onto the GoTek
func (a *Api) mountVolume(r *rest.Rest) error {
	volumeName := r.Var("volume")
	if a.vm.GetVolume(volumeName) == nil {
		r.Status(404)
		return nil
	}

	err := a.gotek.Mount(volumeName)
	if err != nil {
		r.Status(500).
			Value(err.Error())
	} else {
		r.Status(200).
			Value(volumeName)
	}

	return nil
}

// unmountVolume unmounts a volume from the GoTek
func (a *Api) unmountVolume(r *rest.Rest) error {
	volumeName := r.Var("volume")
	if a.vm.GetVolume(volumeName) == nil {
		r.Status(404)
		return nil
	}

	a.gotek.Unmount()
	r.Status(200).
		Value(volumeName)

	return nil
}
