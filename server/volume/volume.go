package volume

import (
  "fmt"
  "github.com/peter-mount/floppyui/server/util"
  "github.com/peter-mount/floppyui/server/ws"
  "golang.org/x/sys/unix"
  "io/ioutil"
  "path"
  "sync"
)

type Volume struct {
  name         string         // Volume name
  mountPoint   string         // Mounting point in filesystem
  volume       string         // Volume backing store path
  status       string         // Status of this volume
  mutex        sync.Mutex     // Mutex to allow atomic updates
  vm           *VolumeManager // pointer to VolumeManager
  contents     Directory      // Scanned contents of volume
  selectedFile string         // The selected file
}

const unitialised = "Uninitialised"

func (v *VolumeManager) NewVolume(name string) *Volume {
  return &Volume{
    vm:         v,
    name:       name,
    mountPoint: path.Join(Mounts, name),
    volume:     path.Join(Volumes, name),
    status:     unitialised,
  }
}

func (v *Volume) Name() string {
  return v.name
}

func (v *Volume) MountPoint() string {
  return v.mountPoint
}

func (v *Volume) Volume() string {
  return v.volume
}

func (v *Volume) Status() string {
  v.mutex.Lock()
  defer v.mutex.Unlock()
  return v.status
}

func (v *Volume) setStatus(s string) {
  v.mutex.Lock()
  defer v.mutex.Unlock()
  v.status = s

  if s != "" {
    ws.Printf("%s: %s", v.name, s)
  }
}

func (v *Volume) setError(s string, err error) error {
  if err == nil {
    v.setStatus("")
  } else {
    v.setStatus(fmt.Sprintf("%s: %s", s, err.Error()))
  }
  return err
}

// LocalPath returns the path on the PI of a file in the mounted volume
func (v *Volume) LocalPath(p string) string {
  return path.Join(v.MountPoint(), p)
}

func (v *Volume) VolumePath(p string) string {
  if len(p) <= len(v.mountPoint) {
    return ""
  }

  return p[len(v.mountPoint)+1:]
}

func (v *Volume) Contents() Directory {
  return v.contents
}

// Statfs updates the provided unix.Statfs_t with details of this Volume
func (v *Volume) Statfs(t *unix.Statfs_t) error {
  return unix.Statfs(v.MountPoint(), t)
}

// Mount mounts the volume under /mnt
func (v *Volume) Mount(scan bool) error {
  v.setStatus("Mounting...")
  err := v.vm.exec.Mkdir(v.MountPoint())
  if err != nil {
    return err
  }

  err = v.vm.exec.Exec("mount", v.Volume(), v.MountPoint(), "-o", "users,umask=000")
  if err != nil {
    ws.Println("Mount", v, "failed", err.Error())
    //return err
  }

  v.readSelectedFile()

  if scan {
    go v.scan()
  }

  v.setStatus(v.String())
  return nil
}

// Umount unmounts the volume from the pi
func (v *Volume) Umount() error {
  initialised := v.Status() != unitialised
  if initialised {
    v.setStatus("Unmounting...")
  }

  err := v.vm.exec.Exec("umount", v.MountPoint())
  if err != nil {
    if initialised {
      return v.setError("Failed to unmount", err)
    }
    return err
  }

  if initialised {
    v.setStatus("Unmounted")
  }
  return nil
}

// String returns human readable details of this volume
func (v *Volume) String() string {
  var st unix.Statfs_t
  err := v.Statfs(&st)
  if err != nil {
    return err.Error()
  }

  return fmt.Sprintf(
    "%s %s used %s free %s total",
    v.Name(),
    util.FileSize((st.Blocks-st.Bavail)*uint64(st.Bsize)),
    util.FileSize(st.Bavail*uint64(st.Bsize)),
    util.FileSize(st.Blocks*uint64(st.Bsize)),
  )
}

func (v *Volume) SelectedFile() string {
  return v.selectedFile
}

func (v *Volume) getSelectedFilename() string {
  return path.Join(v.MountPoint(), "IMAGE_A.CFG")
}
func (v *Volume) readSelectedFile() {
  b, err := ioutil.ReadFile(v.getSelectedFilename())
  if err != nil {
    ws.Printf("GoTek GetVolume %v", err)
    v.selectedFile = ""
  } else {
    v.selectedFile = string(b)
  }
  ws.Println("Vol", v.name, "selected", v.selectedFile)
}

func (v *Volume) SelectFile(f string) error {
  _ = v.Mount(false)

  // 0777 = rwxrwxrwx which is the only valid permission for files on FAT32
  err := ioutil.WriteFile(v.getSelectedFilename(), []byte(f), 0777)
  if err == nil {
    v.selectedFile = f

    b, err := ioutil.ReadFile(v.getSelectedFilename())
    if err == nil {
      ws.Printf("image \"%s\"", string(b))
    } else {
      ws.Println(err)
    }
  }

  return err
}
