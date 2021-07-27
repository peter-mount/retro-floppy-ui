import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import '../../css/workbench.css';

class Icon extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className="wbIcon">
      <div><p.icon/></div>
      <div>{p.name}</div>
    </div>);
  }

}

export default Icon;
