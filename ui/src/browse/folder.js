import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFolder, faFolderOpen} from '@fortawesome/free-regular-svg-icons';
import File from "./file";

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
    const t = this, s = t.state;

    let url = '/api/list/' + s.path;

    fetch(url)
      .then(res => res.json())
      .then(f => t.update(t, f))
      .catch(e => {
        console.error(url, e)
      })
  }

  update(t, f) {
    const p = t.props;
    t.setState({
      open: p.open,
      path: p.path,
      file: f,
    });
  }

  render() {
    const t = this, s = t.state;

    let dirs = null, files = null;

    if (s.file && s.file.files) {
      dirs = s.file.files
        .filter(f => f.dir)
        .map((f, i) => {
          return <Folder
            key={f.path}
            path={f.path}
            info={f}
          />
        })

      files = s.file.files
        .filter(f => !f.dir)
        .map((f, i) => {
          return <File key={f.path} path={f.path} info={f}/>
        })

      dirs.sort((a, b) => a.name < b.name)
      files.sort((a, b) => a.name < b.name)
    }

    return (<div className="folder">
      <span>
        <FontAwesomeIcon icon={s.open ? faFolderOpen : faFolder}/>
        <span className="fileLabel">{s.path == "" ? "/" : s.path}</span>
      </span>
      {dirs}{files}
    </div>);
  }

}

export default Folder;
