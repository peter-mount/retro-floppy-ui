package ws

import (
  "encoding/json"
)

type WS struct {
  clients    map[*Client]bool // Registered clients.
  broadcast  chan []byte      // Inbound messages from the clients.
  register   chan *Client     // Register requests from the clients.
  unregister chan *Client     // Unregister requests from clients.
  //tick       <-chan time.Time
}

func (w *WS) Name() string {
  return "Websocket"
}

func (w *WS) Start() error {
  w.broadcast = make(chan []byte)
  w.register = make(chan *Client)
  w.unregister = make(chan *Client)
  w.clients = make(map[*Client]bool)

  //w.tick = time.Tick(60 * time.Second)

  go w.run()

  return nil
}

func (w *WS) Broadcast(v interface{}) error {
  b, err := json.Marshal(v)
  if err == nil {
    w.broadcast <- b
  }
  return err
}

func (w *WS) run() {
  for {
    select {
    case client := <-w.register:
      w.clients[client] = true

    case client := <-w.unregister:
      if _, ok := w.clients[client]; ok {
        delete(w.clients, client)
        close(client.send)
      }

    case message := <-w.broadcast:
      for client := range w.clients {
        select {
        case client.send <- message:
        default:
          close(client.send)
          delete(w.clients, client)
        }
      }

      /*    case t := <-w.tick:
            go func() {
              err := w.Broadcast(&Message{
                ID:   "tick",
                Time: t,
              })
              if err != nil {
                log.Printf("WS.run %v", err)
              }
            }()
      */
    }
  }
}

type Message struct {
  ID     string      `json:"id"`
  Volume string      `json:"volume,omitempty"`
  File   string      `json:"file,omitempty"`
  Value  interface{} `json:"value,omitempty"`
}
