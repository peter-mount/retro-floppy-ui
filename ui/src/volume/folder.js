import React, {Component} from 'react';
import Window from "../workbench/window";
import File from "../browse/file";
import Icon from "../workbench/icon";

import {amDisk} from '../../src/workbench/disk.svg';

/* Folder represents the contents of a directory in a volume */
class Folder extends Component {

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

    let url = '/api/list/' + p.path;

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

    return (
      <Window title={p.title}
              x={p.x ? p.x : 100} y={p.y ? p.y : 100} w={p.w} h={p.h}
              z={p.z}
              resizable={true}
              close={e => t.closeFolder(e)}>
        <div className="folder">{children}</div>
      </Window>);
  }

  closeFolder(e) {
    const t = this, p = t.props;
    if (p.wb) {
      p.wb.closeWindow(p.id)
    }
  }
}

export default Folder;
