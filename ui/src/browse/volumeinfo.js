import React, {Component} from 'react';

import {withRouter} from 'react-router';
import Window from "../workbench/window";

class VolumeInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState({});
  }

  render() {
    const t = this,p=t.props;
    return (<Window className="volumeInfo browserRight" title="Selected Volume">
      <span>Volume info "{p.volume}"</span>
    </Window>);
  }

}

export default withRouter(VolumeInfo);
