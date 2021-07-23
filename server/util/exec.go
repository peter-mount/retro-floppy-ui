package util

import (
	"os"
	"os/exec"
)

type Exec struct {
}

func (e *Exec) Name() string {
	return "exec"
}

func (e *Exec) Exec(args ...string) error {
	cmd := exec.Command("sudo", args...)
	//log.Println("exec:", strings.Join(args, " "))

	cmd.Stdout = os.Stdout
	//cmd.Stderr = os.Stderr

	return cmd.Run()
}

func (e *Exec) Mkdir(d string) error {
	return e.Exec("mkdir", "-p", d)
}

func (e *Exec) ChownPi(d string) error {
	return e.Exec("chown", "pi:pi", d)
}
