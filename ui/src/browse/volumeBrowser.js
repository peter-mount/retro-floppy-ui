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
    t.wshandler = e => t.handleWS(e)
    p.ws.register({
      exploreVolume: t.wshandler,
    })
  }

  componentWillUnmount() {
    this.props.ws.unregister(this.wshandler)
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
    }
  }

  render() {
    const t = this,
      s = t.state;

    if (s.volume) {
      return (
        <Card>
          <Card.Header>Disk Explorer</Card.Header>
          <Card.Body>
            <Card.Text>
              <Volume name={s.volume}/>
            </Card.Text>
          </Card.Body>
          <Card.Footer>
            <Button variant="link"><FontAwesomeIcon icon={faPlus}/></Button>
            <Button variant="link"><FontAwesomeIcon icon={faMinus}/></Button>
          </Card.Footer>
        </Card>
      )
    }

    return "";
  }

}

export default VolumeBrowser;
