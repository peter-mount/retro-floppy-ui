import React, {Component} from 'react';

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import Table from "react-bootstrap/Table";

import Disksize from "../util/disksize";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCog, faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';
import {faUsb} from '@fortawesome/free-brands-svg-icons';

/* MountedVolumes lists the available volumes in the UI */
class MountedDisk extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this, p = t.props;
    t.wshandler = e => t.handleWS(e)
    p.ws.register({
      diskSelect: t.wshandler,
      unmount: t.wshandler,
    })

    fetch("/api/list")
      .then(res => res.json())
      .then(f => t.setState({
        volume: f.mounted,
        file: f.file,
      }))
      .catch(e => {
        console.error(url, e)
      })
  }

  componentWillUnmount() {
    this.props.ws.unregister(this.wshandler)
  }

  handleWS(e) {
    const t = this, s = t.state;
    switch (e.id) {
      case "diskSelect":
        t.setState({
          volume: e.volume,
          file: e.file,
          update: new Date()
        });
        return
      case "unmount":
        // if volume that was unmounted is this one then remove it
        // Usually it's always the case but can happen if the messages are out of sync
        if (e.volume === s.volume) {
          t.setState({
            volume: null,
            file: null,
            update: new Date()
          });
        }
        return
    }
  }

  render() {
    const t = this,
      s = t.state,
      body = s.volume && s.file
        ? <div>
          <Table>
            <tbody>
            <tr>
              <th>Volume</th>
              <td>{s.volume}</td>
            </tr>
            <tr>
              <th>Disk</th>
              <td>{s.file}</td>
            </tr>
            </tbody>
          </Table>
        </div>
        : <p>No disk is mounted</p>;

    return (
      <Card>
        <Card.Header>Mounted Disk</Card.Header>
        <Card.Body>
          <Card.Text>{body}</Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

export default MountedDisk;
