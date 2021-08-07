package api

import (
  "github.com/peter-mount/go-kernel/rest"
  "time"
)

type systemTask struct {
  Title   string           // Label to show when task runs
  Delay   time.Duration    // Duration to wait before executing task
  Task    []string         // Command to invoke. None if empty
  Hook    func() error     // Hook to call after task runs
  Dynamic func() int       // The number of steps this occupies, e.g. size in MB during volume creation
  StdOut  func(string) int // Called on stdout line, return is new step value or 0 for no-change
}

func (a *Api) runTask(step, stepCount int, title, text string, task systemTask) (int, error) {
  a.ws.Notice(false, title, text, task.Title, step, stepCount)

  if task.Delay > 0 {
    time.Sleep(task.Delay)
  }

  var iStep = step
  var stdout func(string)
  if task.StdOut != nil {
    stdout = func(s string) {
      ds := task.StdOut(s)
      if ds != 0 {
        iStep = step + ds
        a.ws.Notice(false, title, text, task.Title, iStep, stepCount)
      }
    }
  }

  var err error

  if len(task.Task) > 0 {
    err = a.exec.ExecNotify(stdout, task.Task...)
  }

  if err == nil && task.Hook != nil {
    err = task.Hook()
  }

  if err != nil {
    a.ws.Notice(true, "Task failure", err.Error(), task.Title, step, stepCount)
    return step, err
  }

  if task.Dynamic != nil {
    step = step + task.Dynamic()
  }
  return step, nil
}

func (a *Api) systemRun(title, text string, tasks ...systemTask) {
  go func() {
    // Calculate stepCount, normally the number of entries but
    // add task.Dynamic() if set
    // e.g. creating a volume, show status during image creation
    stepCount := len(tasks)
    for _, task := range tasks {
      if task.Dynamic != nil {
        stepCount = stepCount + task.Dynamic()
      }
    }

    step := 1
    for _, task := range tasks {
      newStep, err := a.runTask(step, stepCount, title, text, task)
      if err != nil {
        return
      }
      step = newStep
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
