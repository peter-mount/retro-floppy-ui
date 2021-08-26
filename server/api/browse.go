package api

import (
	"github.com/peter-mount/go-kernel/rest"
	"github.com/peter-mount/retro-floppy-ui/server/volume"
	"github.com/peter-mount/retro-floppy-ui/server/ws"
	"os"
	"path"
	"sort"
	"strings"
	"time"
)

type FileEntry struct {
	Path     string      `json:"path"`
	FullPath string      `json:"fullPath"`
	Name     string      `json:"name"`
	Size     int64       `json:"size"`
	Mode     string      `json:"mode"`
	ModTime  time.Time   `json:"modTime"`
	Dir      bool        `json:"dir,omitempty"`
	Root     bool        `json:"root,omitempty"`
	Files    []FileEntry `json:"files,omitempty"`
}

func getFileEntry(vol, p string, e volume.FileEnt) FileEntry {
	p2 := path.Join(p, e.Name())
	root := p2 == "/"
	n := e.Name()
	if root {
		n = ""
		p2 = ""
	} else if p2[0] == '/' {
		// Strip leading /
		p2 = p2[1:]
	}

	fi := e.Stat()

	if fi == nil {
		return FileEntry{
			Path:     p2,
			FullPath: path.Join(vol, p2),
			Name:     n,
			Dir:      true,
			Root:     true,
		}
	}

	return FileEntry{
		Path:     p2,
		FullPath: path.Join(vol, p2),
		Name:     n,
		Size:     fi.Size(),
		Mode:     fi.Mode().String(),
		ModTime:  fi.ModTime(),
		Dir:      fi.IsDir(),
		Root:     root,
	}
}

func (a *Api) listFiles(r *rest.Rest) error {

	vol := a.vm.GetVolume(r.Var("volume"))
	if vol == nil {
		r.Status(404)
		return nil
	}

	p := r.Var("path")

	p = path.Clean(p)
	ws.Println(p)

	root := vol.Contents()
	if root == nil {
		ws.Println("Fail no root")
		r.Status(404)
		return nil
	}

	dp, fp := path.Split(p)
	for len(dp) > 0 && dp[len(dp)-1] == '/' {
		dp = dp[:len(dp)-1]
	}

	// Skip root
	if dp != "" {
		ws.Printf("scan \"%s\" \"%s\"", dp, fp)
		da := strings.Split(dp, string(os.PathSeparator))
		for idx, n := range da {
			e := root.Find(n)
			if e == nil {
				ws.Printf("Fail %d \"%s\"", idx, n)
				r.Status(404)
				return nil
			}
			if de, ok := e.(volume.Directory); ok {
				root = de
			} else {
				// It's a file not a directory so 406 Not Acceptable
				ws.Printf("Fail %d \"%s\" Wrong type %v", idx, n, root)
				r.Status(406)
				return nil
			}
		}
	}

	// Don't shorten to f:=root as FileEnt != Directory types
	var f volume.FileEnt
	f = root
	// Skip . which is the current directory
	if fp != "" && fp != "." {
		ws.Println("find", fp)
		f = root.Find(fp)
		ws.Println("found", f)
		if f == nil {
			r.Status(404)
			return nil
		}
	}

	ws.Println("File", f)
	fe := getFileEntry(vol.Name(), p, f)
	// Root directory is special
	if fe.Root {
		fe.Path = ""
		fe.Name = ""
	}

	if dir, ok := f.(volume.Directory); ok {

		dp := dir.Name()
		if p != "/" {
			dp = path.Join(p, dp)
		}

		for _, f := range dir.Files() {
			n := f.Name()
			if !strings.HasSuffix(strings.ToLower(n), ".cfg") && n != "." {
				fe.Files = append(fe.Files, getFileEntry(vol.Name(), p, f))
			}
		}
	}

	sort.SliceStable(fe.Files, func(i, j int) bool {
		return strings.ToLower(fe.Files[i].Name) < strings.ToLower(fe.Files[j].Name)
	})

	r.Status(200).
		JSON().
		Value(fe)

	return nil
}
