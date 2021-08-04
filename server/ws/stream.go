package ws

type LogStream struct {
	b []byte
}

func (e *LogStream) Flush() {
	if len(e.b) > 0 {
		Println(string(e.b))
		e.b = nil
	}
}

func (e *LogStream) Write(p []byte) (int, error) {
	n := 0
	for _, b := range p {
		if b == 10 {
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
