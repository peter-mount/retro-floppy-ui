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
	Host Host `yaml:"host"`

	// Web server config
	Server struct {
		Port   int    `yaml:"port"`   // Web server port
		Static string `yaml:"static"` // Static directory with UI
	} `yaml:"server"`

	// If set the file to mount on startup
	Mount struct {
		MountOnBoot bool   `yaml:"mountOnBoot"` // mount on startup
		Volume      string `yaml:"volume"`      // Volume currently mounted
		Path        string `yaml:"path"`        // Path to mount
	} `yaml:"mount"`

	configFile *string // Path to config file
}

type Host struct {
	Hostname string `yaml:"hostname" json:"hostname"`
	Title    string `yaml:"title" json:"title"`
	Computer string `yaml:"computer" json:"computer"`
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
