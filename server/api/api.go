package api

import (
	"github.com/gorilla/handlers"
	"github.com/peter-mount/floppyui/server/volume"
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/rest"
)

type Api struct {
	restService *rest.Server          // web server
	vm          *volume.VolumeManager // Volume manager
	db          *DB                   // Database
}

func (a *Api) Name() string {
	return "api"
}

func (a *Api) Init(k *kernel.Kernel) error {

	service, err := k.AddService(&rest.Server{
		Headers: nil,
		Origins: nil,
		Methods: nil,
		Address: "127.0.0.1", // Bind to localhost as apache will front it
		Port:    8080,        // Port apache will proxy to
	})
	if err != nil {
		return err
	}
	a.restService = (service).(*rest.Server)

	service, err = k.AddService(&volume.VolumeManager{})
	if err != nil {
		return err
	}
	a.vm = (service).(*volume.VolumeManager)

	service, err = k.AddService(&DB{})
	if err != nil {
		return err
	}
	a.db = (service).(*DB)

	return nil
}

func (a *Api) PostInit() error {

	rest := a.restService

	// Add compression to output
	rest.Use(handlers.CompressHandler)

	// System status
	rest.Handle("/api/status", a.getStatus).Methods("GET")

	rest.Handle("/api/list", a.listVolumes).Methods("GET")
	rest.Handle("/api/list/{volume}/{path:[0-9a-zA-Z/._ -]*}", a.listFiles).Methods("GET")

	// DB access - used for UI persistence
	path := "/api/data/{bucket}/{key:[0-9a-zA-Z/._ -]*}"
	rest.Handle(path, a.db.get).Methods("GET")
	rest.Handle(path, a.db.put).Methods("PUT", "POST")
	rest.Handle(path, a.db.put).Methods("DELETE")

	return nil
}
