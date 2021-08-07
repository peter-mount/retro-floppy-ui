package api

import (
  "github.com/peter-mount/go-kernel/rest"
  "time"
)

type systemTask struct {
  Title string
  Delay time.Duration
  Task  []string
}

func (a *Api) runTask(step, stepCount int, title, text string, task systemTask) error {
  a.ws.Notice(false, title, text, task.Title, step, stepCount)

  if task.Delay > 0 {
    time.Sleep(task.Delay)
  }

  err := a.exec.Exec(task.Task...)
  if err != nil {
    a.ws.Notice(true, "Task failure", err.Error(), task.Title, step, stepCount)
    return err
  }
  return nil
}

func (a *Api) systemRun(title, text string, tasks ...systemTask) {
  go func() {
    stepCount := len(tasks)
    for step, task := range tasks {
      err := a.runTask(step+1, stepCount, title, text, task)
      if err != nil {
        return
      }
    }
    a.ws.ClearNotices()
  }()
}

func (a *Api) rebootSystem(r *rest.Rest) error {
  return a.shutdown("reboot", "-r", r)
}

func (a *Api) shutdownSystem(r *rest.Rest) error {
  return a.shutdown("shutdown", "-h", r)
}

func (a *Api) shutdown(t, f string, r *rest.Rest) error {
  a.systemRun("", "System "+t+" started", shutdownTask("", f))
  r.Status(200)
  return nil
}

func shutdownTask(t, f string) systemTask {
  return systemTask{
    Delay: 4 * time.Second, // Delay to allow notice to go out
    Title: t,
    Task:  []string{"shutdown", f, "now"},
  }
}

func (a *Api) updateSystem(r *rest.Rest) error {
  a.systemRun("", "System update started",
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
    // Reboot once update has completed. Must be done if kernel is updated when ToTek mounting fails until reboot.
    shutdownTask("reboot", "-r"),
  )
  r.Status(200)
  return nil
}
