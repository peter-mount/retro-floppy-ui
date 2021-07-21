package api

import (
	"github.com/peter-mount/go-kernel/rest"
	"io/ioutil"
	"os"
	"path"
	"time"
)

type FileEntry struct {
	Path    string      `json:"path"`
	Name    string      `json:"name"`
	Size    int64       `json:"size"`
	Mode    string      `json:"mode"`
	ModTime time.Time   `json:"modTime"`
	Dir     bool        `json:"dir,omitempty"`
	Root    bool        `json:"root,omitempty"`
	Files   []FileEntry `json:"files,omitempty"`
}

func getFileEntry(p string, fi os.FileInfo) FileEntry {
	p2 := path.Join(p, fi.Name())
	root := p2 == "/"
	n := fi.Name()
	if root {
		n = ""
		p2 = ""
	} else {
		// Strip leading /
		p2 = p2[1:]
	}
	return FileEntry{
		Path:    p2,
		Name:    n,
		Size:    fi.Size(),
		Mode:    fi.Mode().String(),
		ModTime: fi.ModTime(),
		Dir:     fi.IsDir(),
		Root:    root,
	}
}

func (a *Api) listFiles(r *rest.Rest) error {

	p := r.Var("path")

	p = path.Clean("/" + p)
	lp := path.Join(a.config.Volume.Path, p)

	fi, err := os.Stat(lp)
	if err != nil {
		return err
	}

	fe := getFileEntry(p, fi)
	// Root directory is special
	if fe.Root {
		fe.Path = ""
		fe.Name = ""
	}

	if fi.IsDir() {
		dp := fi.Name()
		if p != "/" {
			dp = path.Join(p, dp)
		}

		files, err := ioutil.ReadDir(lp)
		if err != nil {
			return err
		}

		for _, f := range files {
			fe.Files = append(fe.Files, getFileEntry(p, f))
		}
	}

	r.Status(200).
		JSON().
		Value(fe)

	return nil
}
