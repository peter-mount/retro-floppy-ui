package api

import (
	"github.com/gorilla/handlers"
	"github.com/peter-mount/floppyui/server/util"
	"github.com/peter-mount/floppyui/server/volume"
	"github.com/peter-mount/floppyui/server/ws"
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/rest"
)

type Api struct {
	restService *rest.Server          // web server
	ws          *ws.WS                // Websocket handler
	vm          *volume.VolumeManager // Volume manager
	gotek       *volume.Gotek         // Gotek manager
	exec        *util.Exec            // Exec manager
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

	service, err = k.AddService(&volume.Gotek{})
	if err != nil {
		return err
	}
	a.gotek = (service).(*volume.Gotek)

	service, err = k.AddService(&util.Exec{})
	if err != nil {
		return err
	}
	a.exec = (service).(*util.Exec)

	service, err = k.AddService(&DB{})
	if err != nil {
		return err
	}
	a.db = (service).(*DB)

	service, err = k.AddService(&ws.WS{})
	if err != nil {
		return err
	}
	a.ws = (service).(*ws.WS)

	return nil
}

func (a *Api) PostInit() error {

	restService := a.restService

	// Add compression to output
	restService.Use(handlers.CompressHandler)

	// System status
	restService.Handle("/api/status", a.getStatus).Methods("GET")

	restService.Handle("/api/list", a.listVolumes).Methods("GET")
	restService.Handle("/api/list/{volume}/{path:[0-9a-zA-Z/._ -]*}", a.listFiles).Methods("GET")

	restService.Handle("/api/mount/{volume}/{path:[0-9a-zA-Z/._ -]*}", a.mountDisk).Methods("GET")

	restService.Handle("/api/mount/{volume}", a.mountVolume).Methods("GET")
	restService.Handle("/api/unmount/{volume}", a.unmountVolume).Methods("GET")

	// Volume admin
	path := "/api/volume/{volume}"
	restService.Handle(path+"/{size:[0-9]+[mg]}", a.volumeCreate).Methods("PUT")

	// DB access - used for UI persistence
	path = "/api/data/{bucket}/{key:[0-9a-zA-Z/._ -]*}"
	restService.Handle(path, a.db.get).Methods("GET")
	restService.Handle(path, a.db.put).Methods("PUT", "POST")
	restService.Handle(path, a.db.put).Methods("DELETE")

	// System admin
	restService.Handle("/api/system/update", a.updateSystem).Methods("GET")
	restService.Handle("/api/system/reboot", a.rebootSystem).Methods("GET")
	restService.Handle("/api/system/shutdown", a.shutdownSystem).Methods("GET")

	// Websocket
	restService.HandleFunc("/ws", a.ws.ServeWs)
	return nil
}
