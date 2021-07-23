import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMinusSquare, faPlusSquare, faHdd} from '@fortawesome/free-regular-svg-icons';
import File from "./file";
import Folder from "./folder";

class Volume extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
    };
  }

  componentDidMount() {
    const t = this, s = t.state;
    if (s.open) {
      this.refresh()
    }
  }

  refresh() {
    const t = this, p=t.props,s = t.state;

    let url = '/api/list/' + p.name+"/";

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
    const t = this, p=t.props,s = t.state;

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
            volume={p.name}
            path={f.path}
            info={f}
          />
        })

      files = s.file.files
        .filter(f => !f.dir)
        .map((f, i) => {
          return <File key={f.path} volume={p.name} path={f.path} info={f}/>
        })

      dirs.sort((a, b) => a.name < b.name)
      files.sort((a, b) => a.name < b.name)
    }

    return (<div className="folder">
      <span onClick={() => t.toggle(t)}>
        <FontAwesomeIcon icon={s.open ? faMinusSquare : faPlusSquare}/>
        <FontAwesomeIcon icon={faHdd}/>
        <span className="fileLabel">{p.name}</span>
      </span>
      <div>{dirs}{files}</div>
    </div>);
  }

}

export default Volume;
