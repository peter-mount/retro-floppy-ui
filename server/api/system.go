package api

import (
	"github.com/peter-mount/floppyui/server/ws"
	"github.com/peter-mount/go-kernel/rest"
)

type systemTask struct {
	Title string
	Task  []string
}

func (a *Api) runTask(title, text string, task systemTask) error {
	a.ws.Notice(false, title, text, task.Title)
	err := a.exec.Exec(task.Task...)
	if err != nil {
		a.ws.Notice(true, "Task failure", err.Error(), task.Title)
		return err
	}
	return nil
}

func (a *Api) systemRun(title, text string, tasks ...systemTask) error {
	for _, task := range tasks {
		err := a.runTask(title, text, task)
		if err != nil {
			return err
		}
	}
	return nil
}

func (a *Api) updateSystem(r *rest.Rest) error {

	ws.Println("Performing system update")

	err := a.systemRun("", "System update started",
		systemTask{
			Title: "apt update",
			Task:  []string{"apt", "update"},
		},
		systemTask{
			Title: "apt upgrade",
			Task:  []string{"apt", "upgrade", "-y"},
		},
		systemTask{
			Title: "apt autoremove",
			Task:  []string{"apt", "autoremove", "-y"},
		},
	)

	if err == nil {
		ws.Println("Update complete")
		a.ws.ClearNotices()
		r.Status(200)
	}

	return err
}
