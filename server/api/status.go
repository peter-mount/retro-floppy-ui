package api

import (
  "github.com/peter-mount/floppyui/server/config"
  "github.com/peter-mount/go-kernel/rest"
  "golang.org/x/sys/unix"
)

type Status struct {
  Host config.Host   `json:"host"`
  Disk unix.Statfs_t `json:"disk"`
}

type DiskStatus struct {
  Type    int64  `json:"type"`
  Bsize   int64  `json:"bsize"`
  Blocks  uint64 `json:"blocks"`
  Bfree   uint64 `json:"bfree"`
  Bavail  uint64 `json:"bavail"`
  Files   uint64 `json:"files"`
  Ffree   uint64 `json:"ffree"`
  Namelen int64  `json:"namelen"`
}

func (a *Api) getStatus(r *rest.Rest) error {

  response := Status{Host: a.config.Host}

  err := unix.Statfs(a.config.Volume.Path, &response.Disk)
  if err != nil {
    return err
  }

  r.Status(200).
    JSON().
    Value(&response)

  return nil
}
