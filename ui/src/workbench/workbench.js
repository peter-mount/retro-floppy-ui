import React, {Component} from 'react';

class Workbench extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className="workbench">{p.children}</div>);
  }

}

export default Workbench;
