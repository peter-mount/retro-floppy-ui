package volume

import (
  "github.com/peter-mount/floppyui/server/ws"
  "os"
  "path"
  "path/filepath"
  "strings"
)

type FileEnt interface {
  Name() string      // Name of entry
  Path() string      // Full path from root
  Stat() os.FileInfo // file status, sizes etc
}

type File interface {
  FileEnt
}

type Directory interface {
  FileEnt
  Files() []FileEnt
  Find(n string) FileEnt
}

type file struct {
  name string
  path string
  stat os.FileInfo
}

func (d file) Name() string {
  return d.name
}

func (d file) Path() string {
  return d.path
}

func (d file) Stat() os.FileInfo {
  return d.stat
}

func (d file) String() string {
  return "File:" + d.path
}

type directory struct {
  name  string
  path  string
  stat  os.FileInfo
  files map[string]FileEnt // Files in this directory
}

func (d directory) Name() string {
  return d.name
}

func (d directory) Path() string {
  return d.path
}

func (d directory) Stat() os.FileInfo {
  return d.stat
}

func (d directory) Files() []FileEnt {
  var a []FileEnt
  for _, e := range d.files {
    a = append(a, e)
  }
  return a
}

func (d directory) String() string {
  return "dir:" + d.path
}

func (d directory) Find(n string) FileEnt {
  return d.files[n]
}

func (d *directory) add(f FileEnt) {
  d.files[f.Name()] = f
}

func (v *Volume) FindPath(p string) FileEnt {
  found := v.contents
  for _, dp := range strings.Split(p, string(os.PathSeparator)) {
    if dp != "." {
      e := found.Find(dp)
      if d, ok := e.(Directory); ok {
        found = d
      } else {
        return nil
      }
    }
  }
  return found
}

func (v *Volume) findDir(p string) Directory {
  return v.FindPath(path.Dir(p)).(Directory)
}

func (v *Volume) walkDir(f func(f FileEnt) error) error {
  return v.walkDirInt(v.contents, f)
}

func (v *Volume) walkDirInt(d Directory, f func(f FileEnt) error) error {
  if d == nil {
    return nil
  }
  for _, e := range d.Files() {
    err := f(e)
    if err == nil && e.Stat().IsDir() {
      err = v.walkDirInt(e.(Directory), f)
    }
    if err != nil {
      return err
    }
  }
  return nil
}

func (v *Volume) scan() error {
  ws.Println("Scanning", v.name)
  v.contents = &directory{
    files: make(map[string]FileEnt),
  }

  err := filepath.Walk(v.mountPoint, func(p string, info os.FileInfo, err error) error {
    if err != nil {
      return err
    }
    pName := v.VolumePath(p)

    var f FileEnt
    if info.IsDir() {
      f = &directory{
        name:  path.Base(pName),
        path:  pName,
        stat:  info,
        files: make(map[string]FileEnt),
      }
    } else {
      f = &file{
        name: path.Base(pName),
        path: pName,
        stat: info,
      }
    }

    dir := v.findDir(pName).(*directory)
    dir.add(f)

    return nil
  })

  if err == nil {
    v.readSelectedFile()

    err = v.vm.ws.Broadcast(ws.Message{
      ID:     "diskScan",
      Volume: v.name,
      File:   v.selectedFile,
    })
  }

  return err
}
