package server

import (
	api2 "github.com/peter-mount/floppyui/server/api"
	config2 "github.com/peter-mount/floppyui/server/config"
	"github.com/peter-mount/go-kernel"
)

type Server struct {
	config *config2.Config // Config file
	api    *api2.Api       // API
	ui     *UI             // UI
}

func (s *Server) Name() string {
	return "server"
}

func (s *Server) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&config2.Config{})
	if err != nil {
		return err
	}
	s.config = (service).(*config2.Config)

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

	return nil
}
