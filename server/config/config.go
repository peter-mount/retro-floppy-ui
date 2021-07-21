package config

import (
	"flag"
	"github.com/peter-mount/go-kernel"
	"gopkg.in/yaml.v2"
	"os"
	"path/filepath"
)

type Config struct {
	// Config for this node
	Node struct {
		Hostname string `yaml:"hostname"`
	} `yaml:"node"`

	// Web server config
	Server struct {
		Port   int    `yaml:"port"`   // Web server port
		Static string `yaml:"static"` // Static directory with UI
	} `yaml:"server"`

	// Volume config - this is where the disk images exposed to the gotek are placed
	Volume struct {
		Path   string `yaml:"path"`   // Mount point for vfat volume
		Mount  string `yaml:"mount"`  // Command to mount the storage onto the gotek
		Umount string `yaml:"umount"` // Command to unmount the storage so the gotek cannot access it anymore
	} `yaml:"volume"`

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
