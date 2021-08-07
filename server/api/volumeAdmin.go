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
  // Convert to MB then into 512 blocks (2048 in 1Mb)
  // Note we need to use 512 blocks for status=progress to work which is disabled if BS= is used in dd
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
        // Don't set BS= here, it'll break status=progress
        "if=/dev/zero",
        "of=" + volume.Volume(),
        // Count is in 512 byte blocks so convert from MB
        "count=" + strconv.Itoa(size*2048),
        "status=progress",
      },
      // Step size is in MB
      Dynamic: func() int {
        return size
      },
      // For each line to stdout from command update client to see progress
      StdOut: func(s string) int {
        v := strings.Split(s, " ")
        if len(v) > 1 {
          l, err := strconv.Atoi(v[0])
          if err == nil {
            // step size is in MB
            return l / 1048576
          }
        }
        return 0
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
