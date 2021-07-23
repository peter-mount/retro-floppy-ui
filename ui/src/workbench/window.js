import React, {Component} from 'react';

class Window extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this, p = t.props;
    return (<div className={"window "+p.className}>
      <div className="windowTitle">{p.title}</div>
      <div className="windowBody">{p.children}</div>
    </div>);
  }

}

export default Window;
