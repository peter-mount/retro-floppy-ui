package util

import (
	"github.com/peter-mount/floppyui/server/ws"
	"os/exec"
)

type Exec struct {
	stdout []byte
}

func (e *Exec) Name() string {
	return "exec"
}

func (e *Exec) Exec(args ...string) error {
	cmd := exec.Command("sudo", args...)
	//ws.Println("exec:", strings.Join(args, " "))

	//cmd.Stdout = os.Stdout
	stdout := &ws.LogStream{}
	defer stdout.Close()

	cmd.Stdout = stdout
	//cmd.Stderr = os.Stderr

	return cmd.Run()
}

func (e *Exec) Mkdir(d string) error {
	return e.Exec("mkdir", "-p", d)
}

func (e *Exec) ChownPi(d string) error {
	return e.Exec("chown", "pi:pi", d)
}
