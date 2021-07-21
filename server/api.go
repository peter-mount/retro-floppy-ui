package server

import (
	"github.com/gorilla/handlers"
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/rest"
)

type Api struct {
	config      *Config      // Config file
	restService *rest.Server // web server
}

func (a *Api) Name() string {
	return "api"
}

func (a *Api) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&Config{})
	if err != nil {
		return err
	}
	a.config = (service).(*Config)

	service, err = k.AddService(&rest.Server{})
	if err != nil {
		return err
	}
	a.restService = (service).(*rest.Server)

	return nil
}

func (a *Api) PostInit() error {

	// The port to use for rest service
	a.restService.Port = a.config.Server.Port
	if a.restService.Port < 1024 || a.restService.Port > 65535 {
		a.restService.Port = 3000
	}

	// Add compression to output
	a.restService.Use(handlers.CompressHandler)

	return nil
}
