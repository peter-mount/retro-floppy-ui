import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-regular-svg-icons';
import {apiMount} from "../util/api";

class File extends Component {

  constructor(props) {
    super(props);
    this.state = {
      path: props.path,
      info: props.info
    };
  }

  doubleClick(e) {
    apiMount(this.props.info.fullPath)
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
