package volume

import (
	"errors"
	"log"
	"os"
	"path"
	"path/filepath"
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
	files []FileEnt // Files in this directory
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
	return d.files
}

func (d directory) String() string {
	return "dir:" + d.path
}

func (d *directory) add(f FileEnt) {
	d.files = append(d.files, f)
}

func (v *Volume) findDir(p string) Directory {
	dir := path.Dir(p)
	found := v.contents
	_ = v.walkDir(func(f FileEnt) error {
		if d, isDir := f.(Directory); isDir {
			if f.Path() == dir {
				found = d
				return errors.New("found")
			}
		}
		return nil
	})
	return found
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
	log.Println("Scanning", v.name)
	v.contents = &directory{}
	return filepath.Walk(v.mountPoint, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		pName := v.VolumePath(p)

		var f FileEnt
		if info.IsDir() {
			f = &directory{
				name: path.Base(pName),
				path: pName,
				stat: info,
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
}
