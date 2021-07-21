package server

import (
	"github.com/peter-mount/go-kernel"
)

type Server struct {
	config *Config // Config file
	api    *Api    // API
}

func (s *Server) Name() string {
	return "server"
}

func (s *Server) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&Config{})
	if err != nil {
		return err
	}
	s.config = (service).(*Config)

	service, err = k.AddService(&Api{})
	if err != nil {
		return err
	}
	s.api = (service).(*Api)

	return nil
}
