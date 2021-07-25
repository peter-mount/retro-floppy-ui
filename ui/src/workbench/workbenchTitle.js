import React, {Component} from 'react';

import '../../css/workbench.css';
import DepthGadget from "../../src/workbench/depthGadget.svg";

class WorkbenchTitle extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className="workbenchTitle raised"><span>{p.children}</span><DepthGadget className="depthGadget"/></div>);
  }

}

export default WorkbenchTitle;
