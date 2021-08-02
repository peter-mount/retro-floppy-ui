package volume

import (
  "fmt"
  "github.com/peter-mount/floppyui/server/util"
  "github.com/peter-mount/floppyui/server/ws"
  "github.com/peter-mount/go-kernel"
  "io/ioutil"
  "log"
  "path"
)

type Gotek struct {
  vm     *VolumeManager // Volume manager
  exec   *util.Exec     // Command executor
  ws     *ws.WS         // Websocket broker
  volume string         // Currently mounted volume
}

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

func (g *Gotek) Unmount() {
  if g.volume != "" {
    _ = g.exec.Exec("modprobe", "-r", "g_mass_storage")
    _ = g.ws.Broadcast(ws.Message{ID: "unmount", Volume: g.volume})
    g.volume = ""
  }
}

func (g *Gotek) Mount(v string) error {
  volume := g.vm.GetVolume(v)
  if volume == nil {
    return fmt.Errorf("unknown volume \"%s\"", v)
  }

  g.Unmount()

  err := g.exec.Exec("modprobe", "g_mass_storage", "file="+volume.Volume(), "stall=0")
  if err == nil {
    g.volume = v
    _ = g.ws.Broadcast(ws.Message{ID: "mount", Volume: v})

    // If disk is selected then broadcast it
    f := g.SelectedFile()
    if f != "" {
      _ = g.ws.Broadcast(ws.Message{ID: "diskSelect", Volume: v, File: f})
    }
  }
  return err
}

func (g *Gotek) SelectedFile() string {
  if g.volume == "" {
    return ""
  }

  v := g.vm.GetVolume(g.volume)
  if v == nil {
    return ""
  }

  b, err := ioutil.ReadFile(path.Join(v.MountPoint(), "IMAGE_A.CFG"))
  if err != nil {
    log.Printf("GoTek GetVolume %v", err)
    return ""
  }
  return string(b)
}
