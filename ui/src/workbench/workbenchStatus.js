import React, {Component} from 'react';

import '../../css/workbench.css';

class WorkbenchStatus extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className="workbenchTitle raised">{p.children}</div>);
  }

}

export default WorkbenchStatus;
