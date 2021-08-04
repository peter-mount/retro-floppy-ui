import React, {Component} from 'react';

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";

/* MountedVolumes lists the available volumes in the UI */
class DiskInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this, p = t.props;
    t.wshandler = e => t.handleWS(e)
    p.ws.register({
      diskInfo: t.wshandler,
      unmount: t.wshandler,
    })

/*
    fetch("/api/list")
      .then(res => res.json())
      .then(f => t.setState({
        volume: f.mounted,
        file: f.file,
      }))
      .catch(e => {
        console.error(url, e)
      })
*/
  }

  componentWillUnmount() {
    this.props.ws.unregister(this.wshandler)
  }

  handleWS(e) {
    const t = this, s = t.state;
    switch (e.id) {
      case "diskInfo":
        t.setState({
          info: e,
          update: new Date()
        });
        return
      case "unmount":
        // if volume that was unmounted is this one then remove it
        // Usually it's always the case but can happen if the messages are out of sync
        //if (e.volume === s.volume) {
        t.setState({
          info: null,
          update: new Date()
        });
        //}
        return
    }
  }

  render() {
    const t = this,
      s = t.state;

    return (
      <Card>
        <Card.Header>Disk Info</Card.Header>
        <Card.Body>
          <Card.Text>
            <Table>
              <tbody>
              <tr>
                <th>Volume</th>
                <td>Not volume mounted</td>
              </tr>
              <tr>
                <th>Disk</th>
                <td>No disk mounted</td>
              </tr>
              </tbody>
            </Table>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

export default DiskInfo;
