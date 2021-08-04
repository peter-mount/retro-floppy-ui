package ws

import (
  "fmt"
  "log"
  "strings"
  "time"
)

var logger *WS

const timeFormat = "2006/01/02 15:04:05 "

func Print(v ...interface{}) {
  logout(fmt.Sprint(v...))
}

func Println(v ...interface{}) {
  logout(fmt.Sprintln(v...))
}

func Printf(format string, v ...interface{}) {
  logout(fmt.Sprintf(format, v...))
}

func logout(s string) {
  log.Print(s)
  if logger != nil {
    logger.log(s)
  }
}

func (w *WS) log(s string) {
  t := time.Now().Format(timeFormat)

  if s == "" {
    return
  }

  for _, l := range strings.Split(s, "\n") {
    for len(l) > 80 {
      w.logImpl(t + l[:80])
      l = l[80:]
    }
    w.logImpl(t + l)
  }
}

func (w *WS) logImpl(s string) {
  _ = w.Broadcast(Message{
    ID:    "log",
    Value: s,
  })
}
