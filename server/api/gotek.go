package api

import (
  "github.com/peter-mount/floppyui/server/volume"
  "github.com/peter-mount/go-kernel/rest"
)

func (a *Api) mountDisk(r *rest.Rest) error {
  volumeName := r.Var("volume")
  fileName := r.Var("path")

  if fileName == "" {
    r.Status(406)
    return nil
  }

  vol := a.vm.GetVolume(volumeName)
  if vol == nil {
    r.Status(404)
    return nil
  }

  fe := vol.FindPath(fileName)
  if _, isDir := fe.(volume.Directory); isDir {
    // Cannot mount a directory so return BadRequest
    r.Status(400)
    return nil
  }

  err := a.gotek.MountDisk(volumeName, fileName)
  if err != nil {
    r.Status(500).
      Value(err.Error())
  } else {
    r.Status(200).
      Value(volumeName)
  }

  return nil
}
