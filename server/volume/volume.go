package volume

import (
	"fmt"
	"github.com/peter-mount/floppyui/server/util"
	"golang.org/x/sys/unix"
	"log"
	"path"
	"strconv"
	"sync"
)

type Volume struct {
	name       string         // Volume name
	mountPoint string         // Mounting point in filesystem
	volume     string         // Volume backing store path
	status     string         // Status of this volume
	mutex      sync.Mutex     // Mutex to allow atomic updates
	vm         *VolumeManager // pointer to VolumeManager
}

const unitialised = "Uninitialised"

func (v *VolumeManager) newVolume(name string) *Volume {
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
		log.Printf("%s: %s", v.name, s)
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

// Statfs updates the provided unix.Statfs_t with details of this Volume
func (v *Volume) Statfs(t *unix.Statfs_t) error {
	return unix.Statfs(v.MountPoint(), t)
}

// Mount mounts the volume under /mnt
func (v *Volume) Mount() error {
	v.setStatus("Mounting...")
	err := v.vm.exec.Mkdir(v.MountPoint())
	if err != nil {
		return err
	}

	err = v.vm.exec.Exec("mount", v.Volume(), v.MountPoint(), "-o", "users,umask=000")
	if err != nil {
		return err
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

// Create creates the volume backingstore. The size is in MiB
func (v *Volume) Create(size uint) error {
	v.setStatus("Creating volume...")
	err := v.vm.exec.Exec("dd", "bs=1M", "if=/dev/zero", "of="+v.Volume(), "count="+strconv.Itoa(int(size)))
	if err != nil {
		return v.setError("Failed to create", err)
	}

	v.setStatus("Formatting...")
	err = v.vm.exec.Exec("mkdosfs", v.Volume(), "-F", "32", "-I")
	if err != nil {
		return v.setError("Failed to format", err)
	}

	return v.Mount()
}
