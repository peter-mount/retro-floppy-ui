package api

import (
	"github.com/peter-mount/floppyui/server/config"
	"github.com/peter-mount/floppyui/server/volume"
	"github.com/peter-mount/go-kernel/rest"
	"golang.org/x/sys/unix"
)

type Status struct {
	Host config.Host              `json:"host"`
	Disk map[string]unix.Statfs_t `json:"disk"`
}

func (a *Api) getStatus(r *rest.Rest) error {

	response := Status{
		Host: a.config.Host,
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
