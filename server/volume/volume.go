package volume

import (
	"fmt"
	"github.com/peter-mount/floppyui/server/util"
	"golang.org/x/sys/unix"
	"path"
)

type Volume struct {
	vm         *VolumeManager
	Name       string
	MountPoint string
	Volume     string
}

func (v *Volume) LocalPath(p string) string {
	return path.Join(v.Name, p)
}

func (v *Volume) Statfs(t *unix.Statfs_t) error {
	return unix.Statfs(v.MountPoint, t)
}

// Mount mounts the volume under /mnt
func (v *Volume) Mount() error {
	err := v.vm.exec.Mkdir(v.MountPoint)
	if err != nil {
		return err
	}

	return v.vm.exec.Exec("mount", v.Volume, v.MountPoint, "-o", "users,umask=000")
}

func (v *Volume) Umount() error {
	return v.vm.exec.Exec("umount", v.MountPoint)
}

func (v *Volume) String() string {
	var st unix.Statfs_t
	err := v.Statfs(&st)
	if err != nil {
		return err.Error()
	}

	return fmt.Sprintf(
		"%s %s used %s free %s total",
		v.Name,
		util.FileSize((st.Blocks-st.Bavail)*uint64(st.Bsize)),
		util.FileSize(st.Bavail*uint64(st.Bsize)),
		util.FileSize(st.Blocks*uint64(st.Bsize)),
	)
}
