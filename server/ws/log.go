package ws

import (
	"fmt"
	"log"
	"strings"
	"time"
)

var logger *WS
var lastTime time.Time

const (
	timeFormat = "15:04:05 "
	dateFormat = "2006/01/02"
)

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
	now := time.Now()
	/*t := now.Format(timeFormat)

	  if lastTime.IsZero() || now.Day() != lastTime.Day() {
	    w.logImpl(now.Format(dateFormat))
	  }*/
	lastTime = now

	if s == "" {
		return
	}

	for _, l := range strings.Split(s, "\n") {
		for len(l) > 80 {
			w.logImpl(l[:80])
			//w.logImpl(t + l[:80])
			l = l[80:]
		}
		w.logImpl(l)
		//w.logImpl(t + l)
	}
}

func (w *WS) logImpl(s string) {
	_ = w.Broadcast(Message{
		ID:    "log",
		Value: s,
	})
}
