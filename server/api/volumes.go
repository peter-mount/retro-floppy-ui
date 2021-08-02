package api

import (
  "github.com/peter-mount/floppyui/server/volume"
  "github.com/peter-mount/go-kernel/rest"
  "golang.org/x/sys/unix"
)

func (a *Api) listVolumes(r *rest.Rest) error {

  volumeList := make(map[string]unix.Statfs_t)

  err := a.vm.ForEach(func(volume *volume.Volume) error {
    var s unix.Statfs_t
    err := volume.Statfs(&s)
    if err == nil {
      volumeList[volume.Name()] = s
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
