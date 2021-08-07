package ws

type LogStream struct {
  b      []byte
  Notify func(string)
}

func (e *LogStream) Flush() {
  if len(e.b) > 0 {
    s := string(e.b)
    logWs(s)

    if e.Notify != nil {
      e.Notify(s)
    }

    e.b = nil
  }
}

func (e *LogStream) Write(p []byte) (int, error) {
  n := 0
  for _, b := range p {
    if b == 10 || b == 13 {
      e.Flush()
    } else if b >= 32 {
      e.b = append(e.b, b)
    }

    n++
  }

  return n, nil
}

func (e *LogStream) Close() error {
  e.Flush()
  return nil
}
