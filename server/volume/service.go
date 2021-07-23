package volume

import (
	"github.com/peter-mount/floppyui/server/config"
	"github.com/peter-mount/floppyui/server/util"
	"github.com/peter-mount/go-kernel"
	"golang.org/x/sys/unix"
	"log"
	"os"
	"sort"
	"sync"
)

const (
	Volumes = "/volumes"
	Mounts  = "/mnt"
)

type VolumeManager struct {
	config  *config.Config     // Config file
	exec    *util.Exec         // Command executor
	mutex   sync.Mutex         // Mutex to allow atomic updates
	volumes map[string]*Volume // Map of available volumes
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

	return nil
}

func (v *VolumeManager) Start() error {
	log.Println("Initialising volumes")

	// Ensure volumes directory exist
	err := v.exec.Mkdir(Volumes)
	if err != nil {
		return err
	}

	err = v.exec.ChownPi(Volumes)
	if err != nil {
		return err
	}

	// Scan for volumes
	err = util.ForEachFile(Volumes, func(f os.FileInfo) error {
		if !f.IsDir() {
			return v.AddVolume(f.Name())
		}
		return nil
	})
	if err != nil {
		return err
	}

	if len(v.volumes) == 0 {
		go v.createInitialVolume()
	}

	return nil
}

// Stop the volumes unmounting them
// FIXME this fails probably down to the signal terminating it cancelling the umount commands
func (v *VolumeManager) Stop() {
	log.Println("Unmounting volumes")

	_ = v.ForEach(func(volume *Volume) error {
		_ = volume.Umount()
		return nil
	})
}

// AddVolume dds a volume to the manager
func (v *VolumeManager) AddVolume(n string) error {
	v.mutex.Lock()
	defer v.mutex.Unlock()

	if _, exists := v.volumes[n]; exists {
		return nil
	}

	vol := v.newVolume(n)

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

	return nil
}

// GetVolume returns a Volume by name. returns nil if the name is not matched
func (v *VolumeManager) GetVolume(name string) *Volume {
	v.mutex.Lock()
	defer v.mutex.Unlock()
	return v.volumes[name]
}

// GetVolumeNames returns a sorted slice of volume names
func (v *VolumeManager) GetVolumeNames() []string {
	v.mutex.Lock()
	defer v.mutex.Unlock()
	var a []string

	for k, _ := range v.volumes {
		a = append(a, k)
	}

	sort.SliceStable(a, func(i, j int) bool {
		return a[i] < a[j]
	})

	return a
}

// ForEach will call a function for each mounted volume.
// The invocation order is by sorted list of volume names
func (v *VolumeManager) ForEach(f func(*Volume) error) error {
	for _, n := range v.GetVolumeNames() {
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

// createInitialVolume creates an initial volume if none exists.
// It will create a 2GiB volume with a default name
func (v *VolumeManager) createInitialVolume() {
	vol := v.newVolume("Disks")
	_ = vol.Create(2048)
}
