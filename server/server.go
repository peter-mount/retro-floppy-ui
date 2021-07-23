package server

import (
	api2 "github.com/peter-mount/floppyui/server/api"
	"github.com/peter-mount/floppyui/server/util"
	"github.com/peter-mount/floppyui/server/volume"
	"github.com/peter-mount/go-kernel"
)

type Server struct {
	api  *api2.Api             // API
	ui   *UI                   // UI
	vm   *volume.VolumeManager // Volume manager
	exec *util.Exec            // Command executor
}

func (s *Server) Name() string {
	return "server"
}

func (s *Server) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&util.Exec{})
	if err != nil {
		return err
	}
	s.exec = (service).(*util.Exec)

	service, err = k.AddService(&api2.Api{})
	if err != nil {
		return err
	}
	s.api = (service).(*api2.Api)

	service, err = k.AddService(&UI{})
	if err != nil {
		return err
	}
	s.ui = (service).(*UI)

	service, err = k.AddService(&volume.VolumeManager{})
	if err != nil {
		return err
	}
	s.vm = (service).(*volume.VolumeManager)

	return nil
}
