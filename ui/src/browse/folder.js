import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFolder, faFolderOpen} from '@fortawesome/free-regular-svg-icons';
import File from "./file";
import {apiListFolder} from "../util/api";

class Folder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
      path: props.path,
      info: props.info
    };
  }

  componentDidMount() {
    const t = this, s = t.state;
    if (s.open) {
      this.refresh()
    }
  }

  refresh() {
    const t = this, p = t.props, s = t.state;

    apiListFolder(p.volume, s.path, f => t.update(t, f))
  }

  update(t, f) {
    const s = t.state;
    t.setState({
      open: s.open,
      path: s.path,
      file: f,
    });
  }

  toggle(t) {
    const p = t.props,
      s = t.state;
    t.setState({
      open: p.root ? true : !s.open,
      path: s.path,
      file: p.root || !s.open ? s.file : null,
    });
  }

  render() {
    const t = this, p = t.props, s = t.state;

    console.log("folder path", p.path)

    if (s.open && !s.file) {
      t.refresh()
    }

    let dirs = null, files = null;

    if (s.file && s.file.files) {
      dirs = s.file.files
        .filter(f => f.dir)
        .map((f, i) => {
          return <Folder
            key={f.path}
            volume={p.volume}
            path={f.path}
            info={f}
            selectedDisk={p.selectedDisk}
          />
        })

      files = s.file.files
        .filter(f => !f.dir)
        .map((f, i) => {
          return <File key={f.path} volume={p.volume} path={f.path} info={f} selected={p.selectedDisk===f.path}/>
        })

      dirs.sort((a, b) => a.name < b.name)
      files.sort((a, b) => a.name < b.name)
    }

    return (<div className="folder">
      <span onClick={() => t.toggle(t)}>
        <FontAwesomeIcon icon={s.open ? faFolderOpen : faFolder}/>
        <div className="fileLabel">{s.path === "" ? "/" : baseName(s.path)}</div>
      </span>
      <div>{dirs}{files}</div>
    </div>);
  }

}

function baseName(str) {
  let base = String(str).substring(str.lastIndexOf('/') + 1);
  if (base.lastIndexOf(".") !== -1) {
    base = base.substring(0, base.lastIndexOf("."));
  }
  return base;
}

export default Folder;
