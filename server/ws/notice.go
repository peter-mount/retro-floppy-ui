package ws

type noticeMessage struct {
  Message
  Modal     bool   `json:"modal,omitempty"`     // true if a modal dialog on front end
  Title     string `json:"title,omitempty"`     // title of modal
  Text      string `json:"text"`                // text of modal
  SubText   string `json:"subText,omitempty"`   // subText of modal, "" for none, optional progress bar
  Step      int    `json:"step,omitempty"`      // Step in execution
  StepCount int    `json:"stepCount,omitempty"` // Number of steps, 0=no progress bar
}

func (w *WS) Notice(modal bool, title, text, subText string, step, stepCount int) {
  _ = w.Broadcast(&noticeMessage{
    Message: Message{
      ID: "notice",
    },
    Modal:     modal,
    Title:     title,
    Text:      text,
    SubText:   subText,
    Step:      step,
    StepCount: stepCount,
  })
}

func (w *WS) ClearNotices() {
  _ = w.Broadcast(Message{ID: "notice"})
}
