import React, {Component} from 'react';

import {Accordion} from "react-bootstrap";

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
    const s = t.state;
    t.setState({
      open: s.open,
      file: f,
    });
  }

  render() {
    const t = this, p = t.props, s = t.state;

    console.log(s)

/*
    let children = [];

    if (s.file && s.file.files) {
      s.file.files
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(f => {

          if (f.dir) {
            // Icon to open a folder
            children.push(<Icon key={p.path + ":" + f.name} name={f.name}
                                icon={amDisk} onDoubleClick={e => p.wb.openFolder({
              name: f.name,
              path: f.fullPath,
            }, e)}/>)
          }
        })
    }
*/

    return (
      <Accordion.Item eventKey={0}>
        <Accordion.Header>Volumes</Accordion.Header>
        <Accordion.Body>
          Some body content
        </Accordion.Body>
      </Accordion.Item>)
  }
}

export default MountedVolumes;
