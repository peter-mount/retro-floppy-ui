package api

import (
	"github.com/peter-mount/go-kernel"
	"github.com/peter-mount/go-kernel/bolt"
	"github.com/peter-mount/go-kernel/rest"
	"io/ioutil"
	"log"
)

type DB struct {
	db *bolt.BoltService
}

func (d *DB) Name() string {
	return "DB"
}

const (
	BucketWindow = "window"
)

var buckets = []string{BucketWindow}

func (d *DB) Init(k *kernel.Kernel) error {

	service, err := k.AddService(&bolt.BoltService{
		FileName: "/home/pi/.floppyui.db",
	})
	if err != nil {
		return err
	}
	d.db = (service).(*bolt.BoltService)

	return nil
}

func (d *DB) Start() error {
	log.Println("Initialising database")

	return d.db.Update(func(tx *bolt.Tx) error {
		for _, b := range buckets {
			log.Printf("Bucket: %s", b)
			_, err := tx.CreateBucketIfNotExists(b)
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func notFound(r *rest.Rest) error {
	r.Status(404).
		JSON().
		Value("Not found")
	return nil
}

func (d *DB) view(r *rest.Rest, f func(*bolt.Bucket, string) error) error {
	return d.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket(r.Var("bucket"))
		if bucket == nil {
			return notFound(r)
		}

		return f(bucket, r.Var("key"))
	})
}

func (d *DB) update(r *rest.Rest, f func(*bolt.Bucket, string) error) error {

	return d.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket(r.Var("bucket"))
		if bucket == nil {
			return notFound(r)
		}

		return f(bucket, r.Var("key"))
	})
}

// get implements a rest endpoint to retrieve an object from a bucket
func (d *DB) get(r *rest.Rest) error {
	return d.view(r, func(bucket *bolt.Bucket, key string) error {
		object := bucket.Get(key)
		if object == nil {
			return notFound(r)
		}

		r.Status(200).
			JSON().
			Value(string(object))

		return nil
	})
}

func (d *DB) put(r *rest.Rest) error {
	return d.update(r, func(bucket *bolt.Bucket, key string) error {
		br, err := r.BodyReader()
		if err != nil {
			return err
		}

		object, err := ioutil.ReadAll(br)
		if err != nil {
			return err
		}

		err = bucket.Put(key, object)
		if err != nil {
			return err
		}

		r.Status(200)
		return nil
	})
}
