import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-regular-svg-icons';

class File extends Component {

  constructor(props) {
    super(props);
    this.state = {
      path: props.path,
      info: props.info
    };
  }

  doubleClick(e) {
    fetch('/api/mount/' + this.props.info.fullPath)
      .catch(e => {
        console.error(url, e)
      })
  }

  render() {
    const t = this,
      s = t.state,
      info = s.info;
    return (<div className="folder">
      <span onDoubleClick={e => t.doubleClick(e)}>
        <FontAwesomeIcon icon={faSave}/>
        <span className="fileLabel">{info.name}</span>
      </span>
    </div>);
  }
}

export default File;
