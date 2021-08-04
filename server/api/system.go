package api

import (
	"github.com/peter-mount/floppyui/server/ws"
	"github.com/peter-mount/go-kernel/rest"
)

func (a *Api) updateSystem(r *rest.Rest) error {

	ws.Println("Performing system update")

	err := a.exec.Exec("apt", "update")
	if err != nil {
		return err
	}

	err = a.exec.Exec("apt", "upgrade", "-y")
	if err != nil {
		return err
	}

	err = a.exec.Exec("apt", "autoremove", "-y")
	if err != nil {
		return err
	}

	ws.Println("Update complete")

	r.Status(200)

	return nil
}
