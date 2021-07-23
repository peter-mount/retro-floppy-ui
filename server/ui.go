package server

import (
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/rest"
)

type UI struct {
	restService *rest.Server // web server
}

func (a *UI) Name() string {
	return "ui"
}

func (a *UI) Init(k *kernel.Kernel) error {
	service, err := k.AddService(&rest.Server{})
	if err != nil {
		return err
	}
	a.restService = (service).(*rest.Server)

	return nil
}
