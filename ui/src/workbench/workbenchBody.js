import React, {Component} from 'react';

import '../../css/workbench.css';

class WorkbenchBody extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className="workbenchBody">{p.children}</div>);
  }

}

export default WorkbenchBody;
