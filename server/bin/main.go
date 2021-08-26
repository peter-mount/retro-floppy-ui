package main

import (
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/retro-floppy-ui/server"
	"log"
)

func main() {
	if err := kernel.Launch(&server.Server{}); err != nil {
		log.Fatal(err)
	}
}
