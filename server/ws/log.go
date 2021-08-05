package ws

import (
	"fmt"
	"strings"
)

var logger *WS

// Print equivalent to Println, for compatibility with the log package
func Print(v ...interface{}) {
	log(fmt.Sprint(v...))
}

// Println prints a log line, similar to the log package
func Println(v ...interface{}) {
	log(fmt.Sprintln(v...))
}

// Printf prints a formatted line, similar to the log package
func Printf(format string, v ...interface{}) {
	log(fmt.Sprintf(format, v...))
}

// log logs a string to syslog & clients if enabled
func log(s string) {
	fmt.Println(s)
	if logger != nil {
		logger.log(s)
	}
}

// log broadcasts a log line, breaking it up into 80 char lines
func (w *WS) log(s string) {
	if s == "" {
		return
	}

	for _, l := range strings.Split(s, "\n") {
		for len(l) > 80 {
			w.logImpl(l[:80])
			l = l[80:]
		}
		w.logImpl(l)
	}
}

// logImpl broadcasts the log line to clients
func (w *WS) logImpl(s string) {
	_ = w.Broadcast(Message{
		ID:    "log",
		Value: s,
	})
}
