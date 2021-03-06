import React, {Component} from 'react';

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import {apiLater, apiList, apiUnmount} from "../util/api";

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

    apiList(f => t.setState({
      volume: f.mounted,
      file: f.file,
    }))
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
      mounted = s.volume && s.file;

    return (
      <Card>
        <Card.Header>Mounted Disk</Card.Header>
        <Card.Body>
          <Card.Text>
            <Table>
              <tbody>
              <tr>
                <th>Volume</th>
                <td>{s.volume ? s.volume : "Not volume mounted"}</td>
              </tr>
              <tr>
                <th>Disk</th>
                <td>{mounted ? s.file : "No disk mounted"}</td>
              </tr>
              </tbody>
            </Table>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

export default MountedDisk;
