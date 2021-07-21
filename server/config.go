package server

import (
	"flag"
	"github.com/peter-mount/go-kernel"
	"gopkg.in/yaml.v2"
	"os"
	"path/filepath"
)

type Config struct {
	Server struct {
		Port int `yaml:"port"`
	} `yaml:"server"`

	configFile *string // Path to config file
}

func (c *Config) Name() string {
	return "config"
}

func (c *Config) Init(k *kernel.Kernel) error {
	c.configFile = flag.String("c", "", "The config file to use")

	return nil
}

func (c *Config) PostInit() error {
	// Verify then load the config file
	if *c.configFile == "" {
		*c.configFile = "config.yaml"
		//return fmt.Errorf("No default config defined, provide with -c")
	}

	filename, err := filepath.Abs(*c.configFile)
	if err != nil {
		return err
	}

	f, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(c)
	if err != nil {
		return err
	}

	return nil
}
