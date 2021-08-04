import React, {Component} from 'react';

import Card from "react-bootstrap/Card";

const maxLogSize = 15;

/* LogViewer shows the backend log */
class LogViewer extends Component {

  constructor(props) {
    super(props);

    // Create empty console
    const l = []
    for (let i = 0; i < maxLogSize; i++) {
      l.push("")
    }

    this.state = {
      lines: l,
    };
  }

  componentDidMount() {
    const t = this, p = t.props;
    t.wshandler = e => t.handleWS(e)
    p.ws.register({
      log: t.wshandler,
    })
  }

  componentWillUnmount() {
    this.props.ws.unregister(this.wshandler)
  }

  log(l) {
    if (l) {
      const t = this, s = t.state;
      let lines = s.lines;
      lines.push(l)
      if (lines.length > maxLogSize) {
        lines = lines.splice(-maxLogSize)
      }
      t.setState({
        lines: lines,
        update: new Date()
      });
    }
  }

  handleWS(e) {
    const t = this, s = t.state;
    switch (e.id) {
      case "log":
        t.log(e.value)
        return
    }
  }

  render() {
    const t = this, s = t.state;

    return (
      <Card>
        <Card.Header>Console</Card.Header>
        <Card.Body>
          <Card.Text>
            <div className="consolePanel">
              {s.lines.map((l, i) => <span key={i} className="consoleLine">{l}</span>)}
            </div>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

export default LogViewer;
