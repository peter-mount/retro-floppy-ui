package main

import (
	"github.com/peter-mount/floppyui/server"
	"github.com/peter-mount/go-kernel"
	"log"
)

func main() {
	if err := kernel.Launch(&server.Server{}); err != nil {
		log.Fatal(err)
	}
}
