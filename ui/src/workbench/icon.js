import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import '../../css/workbench.css';

class Icon extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className="wbIcon"
                 onClick={e => t.onClick()}
                 onDoubleClick={e => t.onDoubleClick()}>
      <div>
        <p.icon/>
      </div>
      <div>{p.name}</div>
    </div>);
  }

  onClick(e) {
    const t = this, p = t.props;
    if (p.onClick) {
      p.onClick(e)
    }
  }

  onDoubleClick(e) {
    const t = this, p = t.props;
    if (p.onDoubleClick) {
      p.onDoubleClick(e)
    }
  }

}

export default Icon;
