package util

import (
	"github.com/peter-mount/retro-floppy-ui/server/ws"
	"os/exec"
)

type Exec struct {
	stdout []byte
}

func (e *Exec) Name() string {
	return "exec"
}

func (e *Exec) Exec(args ...string) error {
	return e.ExecNotify(nil, args...)
}

func (e *Exec) ExecNotify(notify func(string), args ...string) error {
	cmd := exec.Command("sudo", args...)
	//ws.Println("exec:", strings.Join(args, " "))

	//cmd.Stdout = os.Stdout
	stdout := &ws.LogStream{Notify: notify}
	defer stdout.Close()

	cmd.Stdout = stdout
	cmd.Stderr = stdout

	return cmd.Run()
}

func (e *Exec) Mkdir(d string) error {
	return e.Exec("mkdir", "-p", d)
}

func (e *Exec) ChownPi(d string) error {
	return e.Exec("chown", "pi:pi", d)
}
