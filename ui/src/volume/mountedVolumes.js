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
class MountedVolumes extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this, p = t.props;
    t.wshandler = e => t.handleWS(e)
    p.ws.register({
      mount: t.wshandler,
      unmount: t.wshandler,
    })
    this.refresh()
  }

  componentWillUnmount() {
    this.props.ws.unregister(this.wshandler)
  }

  handleWS(e) {
    const t = this, s = t.state;
    switch (e.id) {
      case "mount":
        t.setState({
          volumes: s.volumes,
          mounted: e.volume,
          update: new Date()
        });
        return
      case "unmount":
        t.setState({
          volumes: s.volumes,
          mounted: "",
          update: new Date()
        })
        return
    }
  }

  refresh() {
    const t = this, p = t.props, s = t.state;

    let url = '/api/list';

    fetch(url)
      .then(res => res.json())
      .then(f => t.update(t, f))
      .catch(e => {
        console.error(url, e)
      })
  }

  update(t, f) {
    t.setState({
      volumes: f,
      mounted: f ? f.mounted : null,
    });
  }

  mountVolume(n) {
    const t = this, s = t.state;
    fetch("/api/mount/" + n)
      .then(res => res.json())
      .catch(e => {
        console.error(e)
      })
  }

  unmountVolume(n) {
    const t = this, s = t.state;
    fetch("/api/unmount/" + n)
      .then(res => res.json())
      .catch(e => {
        console.error(e)
      })
  }

  render() {
    const t = this, p = t.props, s = t.state, vs = s.volumes;

    let children = [];

    if (vs) {
      Object.keys(vs.volumes)
        .sort((a, b) => a.localeCompare(b))
        .forEach(k => {
          const d = vs.volumes[k],
            avail = d.Bavail * d.Bsize,
            used = (d.Blocks - d.Bavail) * d.Bsize,
            total = d.Blocks * d.Bsize,
            mounted = k === s.mounted,
            mountHandler = mounted ? () => t.unmountVolume(k) : () => t.mountVolume(k);
          children.push(<tr key={k}>
              <td className="cog">
                <Dropdown>
                  <Dropdown.Toggle variant="link">
                    <FontAwesomeIcon icon={mounted ? faUsb : faCog}/>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="explore" onSelect={() => p.ws.broadcast({
                      id: "exploreVolume",
                      volume: k
                    })}>Explore</Dropdown.Item>
                    <Dropdown.Item eventKey="mount"
                                   onSelect={mountHandler}>{mounted ? "Unmount" : "Mount"}</Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item eventKey="destroy" disabled={mounted}>Destroy volume</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
              <td>{k}</td>
              <td><Disksize size={avail}/></td>
              <td><Disksize size={used}/></td>
              <td><Disksize size={total}/></td>
            </tr>
          )
        })
    }

    return (
      <Card>
        <Card.Header>Volumes</Card.Header>
        <Card.Body>
          <Card.Text>
            <Table striped>
              <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Volume</th>
                <th>Free</th>
                <th>Used</th>
                <th>Size</th>
              </tr>
              </thead>
              <tbody>{children}</tbody>
            </Table>
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

export default MountedVolumes;
