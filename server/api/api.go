package api

import (
	"github.com/gorilla/handlers"
	config2 "github.com/peter-mount/floppyui/server/config"
	"github.com/peter-mount/floppyui/server/volume"
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/rest"
)

type Api struct {
	config      *config2.Config       // Config file
	restService *rest.Server          // web server
	vm          *volume.VolumeManager // Volume manager
}

func (a *Api) Name() string {
	return "api"
}

func (a *Api) Init(k *kernel.Kernel) error {
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

	service, err = k.AddService(&volume.VolumeManager{})
	if err != nil {
		return err
	}
	a.vm = (service).(*volume.VolumeManager)

	return nil
}

func (a *Api) PostInit() error {

	rest := a.restService

	// The port to use for rest service
	rest.Port = a.config.Server.Port
	if rest.Port < 1024 || a.restService.Port > 65535 {
		rest.Port = 3000
	}

	// Add compression to output
	rest.Use(handlers.CompressHandler)

	rest.Handle("/api/status", a.getStatus).Methods("GET")
	rest.Handle("/api/list/{volume}/{path:[0-9a-zA-Z/._ -]*}", a.listFiles).Methods("GET")

	return nil
}
