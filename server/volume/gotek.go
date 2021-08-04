package volume

import (
  "fmt"
  "github.com/peter-mount/floppyui/server/util"
  "github.com/peter-mount/floppyui/server/ws"
  "github.com/peter-mount/go-kernel"
  "time"
)

type Gotek struct {
  vm     *VolumeManager // Volume manager
  exec   *util.Exec     // Command executor
  ws     *ws.WS         // Websocket broker
  volume string         // Currently mounted volume
}

// The delay between unmounting gotek & mounting it
const mountDelay = 25 * time.Millisecond

func (g *Gotek) Name() string {
  return "Gotek"
}

func (g *Gotek) Init(k *kernel.Kernel) error {

  service, err := k.AddService(&VolumeManager{})
  if err != nil {
    return err
  }
  g.vm = (service).(*VolumeManager)

  service, err = k.AddService(&util.Exec{})
  if err != nil {
    return err
  }
  g.exec = (service).(*util.Exec)

  service, err = k.AddService(&ws.WS{})
  if err != nil {
    return err
  }
  g.ws = (service).(*ws.WS)

  return nil
}

func (g *Gotek) Mounted() string {
  return g.volume
}

func (g *Gotek) unmount() {
  _ = g.exec.Exec("modprobe", "-r", "g_mass_storage")
}

func (g *Gotek) Unmount() {
  // Unmount from GoTek
  if g.volume != "" {
    volume := g.vm.GetVolume(g.volume)
    if volume != nil {

      g.unmount()

      // mount in local fs
      _ = volume.Mount(true)

      // Broadcast unmount as filesystem is now in sync
      _ = g.ws.Broadcast(ws.Message{ID: "unmount", Volume: g.volume})
      g.volume = ""
    }
  }
}

func (g *Gotek) Mount(v string) error {
  return g.MountDisk(v, "")
}

func (g *Gotek) MountDisk(v, newFile string) error {
  volume := g.vm.GetVolume(v)
  if volume == nil {
    return fmt.Errorf("unknown volume \"%s\"", v)
  }

  // Ensure the gotek is unmounted from any other volume
  if g.volume != v {
    // Different volume so full unmount which will induce a scan & notify client
    g.Unmount()
  } else {
    // Same volume so remove it before remounting but don't scan or notify client
    g.unmount()
  }

  // Time to allow the GoTek to realise it's disconnected
  time.Sleep(mountDelay)

  // If selected file needs changing then quickly mount (no scan) if required & update it
  if volume.SelectedFile() != newFile {
    _ = volume.Mount(false)
    _ = volume.SelectFile(newFile)
  }

  // Unmount the volume
  _ = volume.Umount()

  // Mount on the gotek
  err := g.exec.Exec("modprobe",
    "g_mass_storage",
    "file="+volume.Volume(), // Raw Volume to expose
    "removable=1",           // Allow host to remove?
    "ro=0",                  // Allow writes
    "stall=0",               // Stall TODO what does this do?
  )

  if err == nil {
    g.volume = v
    _ = g.ws.Broadcast(ws.Message{ID: "mount", Volume: v})

    // If disk is selected then broadcast it
    f := volume.SelectedFile()
    if f != "" {
      _ = g.ws.Broadcast(ws.Message{ID: "diskSelect", Volume: v, File: f})
    }
  }
  return err
}
