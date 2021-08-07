import React, {Component} from 'react';

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import Volume from "./volume";

class VolumeBrowser extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this, p = t.props;
    t.wsHandler = e => t.handleWS(e)
    p.ws.register({
      exploreVolume: t.wsHandler,
      diskSelect: t.wsHandler,
    })
  }

  componentWillUnmount() {
    this.props.ws.unregister(this.wsHandler)
  }

  handleWS(e) {
    const t = this, s = t.state;
    switch (e.id) {
      case "exploreVolume":
        t.setState({
          volume: e.volume,
          update: new Date()
        });
        return
      case "diskSelect":
        // Only update if we are the same volume
        t.setState({
          selectedDisk: s.volume === e.volume ? e.file : null,
          update: new Date()
        });
        return
    }
  }

  render() {
    const t = this,
      s = t.state;

    return (
      <Card>
        <Card.Header>Volume: {s.volume ? s.volume : 'None selected'}</Card.Header>
        <Card.Body>
          <Card.Text>
            <Volume volume={s.volume} selectedDisk={s.selectedDisk}/>
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          <Button variant="link"><FontAwesomeIcon icon={faPlus}/></Button>
          <Button variant="link"><FontAwesomeIcon icon={faMinus}/></Button>
        </Card.Footer>
      </Card>
    )
  }

}

export default VolumeBrowser;
