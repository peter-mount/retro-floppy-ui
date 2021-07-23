package util

import (
	"fmt"
	"io/ioutil"
	"os"
)

func ForEachFile(d string, f func(os.FileInfo) error) error {
	files, err := ioutil.ReadDir(d)
	if err != nil {
		return err
	}
	for _, file := range files {
		err = f(file)
		if err != nil {
			return err
		}
	}
	return nil
}

var units = []string{"", " KiB", " MiB", " GiB", " TiB", " PiB", " EiB", " ZiB", " YiB"}

func FileSize(s uint64) string {
	i := 0
	f := float64(s)
	for f >= 1024 && i < len(units) {
		f = f / 1024
		i = i + 1
	}

	return fmt.Sprintf("%.2f%s", f, units[i])
}
