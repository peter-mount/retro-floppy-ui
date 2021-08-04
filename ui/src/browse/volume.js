import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMinusSquare, faPlusSquare, faHdd} from '@fortawesome/free-regular-svg-icons';
import {faHdd as faHddSelected} from '@fortawesome/free-solid-svg-icons';
import File from "./file";
import Folder from "./folder";

class Volume extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    const t = this, p = t.props;

    // Only refresh if we have a volume, undefined means none selected
    if (p.name) {
      let url = '/api/list/' + p.name + "/";

      fetch(url)
        .then(res => res.json())
        .then(f => t.setState({file: f}))
        .catch(e => {
          console.error(url, e)
        })
    }
  }

  render() {
    const t = this,
      p = t.props,
      s = t.state;

    if (!s.file) {
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
          return <File
            key={f.path}
            volume={p.name}
            path={f.path}
            info={f}
          />
        })

      dirs.sort((a, b) => a.name < b.name)
      files.sort((a, b) => a.name < b.name)
    }

    return <div>{dirs}{files}</div>
  }

}

export default Volume;
