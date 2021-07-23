package api

import (
	"github.com/peter-mount/go-kernel/rest"
)

func (a *Api) listVolumes(r *rest.Rest) error {
	r.Status(200).
		JSON().
		Value(a.vm.GetVolumeNames())
	return nil
}
