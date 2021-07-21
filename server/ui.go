package server

import (
	config2 "github.com/peter-mount/floppyui/server/config"
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/rest"
)

type UI struct {
	config      *config2.Config // Config file
	restService *rest.Server    // web server
}

func (a *UI) Name() string {
	return "ui"
}

func (a *UI) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&config2.Config{})
	if err != nil {
		return err
	}
	a.config = (service).(*config2.Config)

	service, err = k.AddService(&rest.Server{})
	if err != nil {
		return err
	}
	a.restService = (service).(*rest.Server)

	return nil
}

func (a *UI) PostInit() error {

	// Add UI
	a.restService.Static("/", a.config.Server.Static)

	return nil
}
