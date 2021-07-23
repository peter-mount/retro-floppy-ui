package volume

import (
	"github.com/peter-mount/floppyui/server/config"
	"github.com/peter-mount/floppyui/server/util"
	"github.com/peter-mount/go-kernel"
	"golang.org/x/sys/unix"
	"log"
	"os"
	"path"
	"sort"
	"sync"
)

const (
	Volumes = "/volumes"
	Mounts  = "/mnt"
)

type VolumeManager struct {
	config *config.Config // Config file
	exec   *util.Exec     // Command executor

	mutex   sync.Mutex
	volumes map[string]*Volume
	names   []string
}

func (v *VolumeManager) Name() string {
	return "Volume"
}

func (v *VolumeManager) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&config.Config{})
	if err != nil {
		return err
	}
	v.config = (service).(*config.Config)

	service, err = k.AddService(&util.Exec{})
	if err != nil {
		return err
	}
	v.exec = (service).(*util.Exec)

	return nil
}

func (v *VolumeManager) PostInit() error {

	v.volumes = make(map[string]*Volume)

	sort.SliceStable(v.names, func(i, j int) bool {
		return v.names[i] < v.names[j]
	})

	return nil
}

func (v *VolumeManager) Start() error {
	log.Println("Initialising volumes")

	// Ensure volumes directory exist exist
	err := v.exec.Mkdir(Volumes)
	if err != nil {
		return err
	}

	err = v.exec.ChownPi(Volumes)
	if err != nil {
		return err
	}

	// Scan for volumes
	return util.ForEachFile(Volumes, func(f os.FileInfo) error {
		if !f.IsDir() {
			return v.AddVolume(f.Name())
		}
		return nil
	})
}

func (v *VolumeManager) AddVolume(n string) error {

	if _, exists := v.volumes[n]; exists {
		return nil
	}

	vol := &Volume{
		vm:         v,
		Name:       n,
		MountPoint: path.Join(Mounts, n),
		Volume:     path.Join(Volumes, n),
	}

	//log.Println("Found volume", n)

	// Ensure its not mounted - ignore the error
	_ = vol.Umount()

	// Mount the mount point
	err := vol.Mount()
	if err != nil {
		return err
	}

	// Finally add to available volume set
	v.volumes[n] = vol

	var st unix.Statfs_t
	err = vol.Statfs(&st)
	if err != nil {
		return err
	}

	log.Println(vol)

	return nil
}

func (v *VolumeManager) GetVolume(name string) *Volume {
	v.mutex.Lock()
	defer v.mutex.Unlock()
	return v.volumes[name]
}

func (v *VolumeManager) ForEach(f func(*Volume) error) error {
	for _, n := range v.names {
		e := v.GetVolume(n)
		if e != nil {
			err := f(e)
			if err != nil {
				return err
			}
		}
	}
	return nil
}
