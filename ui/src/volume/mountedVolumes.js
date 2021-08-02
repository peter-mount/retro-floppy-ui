import React, {Component} from 'react';

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Disksize from "../util/disksize";

/* MountedVolumes lists the available volumes in the UI */
class MountedVolumes extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this, s = t.state;
    this.refresh()
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
    });
  }

  render() {
    const t = this, p = t.props, s = t.state;

    console.log(s)

    let children = [];

    if (s.volumes) {
      Object.keys(s.volumes)
        .sort((a, b) => a.localeCompare(b))
        .forEach(k => {
          const d = s.volumes[k],
            avail = d.Bavail * d.Bsize,
            used = (d.Blocks - d.Bavail) * d.Bsize,
            total = d.Blocks * d.Bsize;
          children.push(<tr key={k}>
            <td>{k}</td>
            <td><Disksize size={avail}/></td>
            <td><Disksize size={used}/></td>
            <td><Disksize size={total}/></td>
          </tr>)
        })
    }

    return (<Card>
        <Card.Header>Volumes</Card.Header>
        <Card.Body>
          <Card.Text>
            <Table striped>
              <thead>
              <tr>
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
      </Card>
    )
  }
}

export default MountedVolumes;
