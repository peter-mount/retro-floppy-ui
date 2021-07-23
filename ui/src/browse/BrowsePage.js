import React, {Component} from 'react';

import {withRouter} from 'react-router';
import Volumes from "./volumes";
import VolumeInfo from "./volumeinfo";

class BrowsePage extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState({});
  }

  update(v) {
    if (v === null) {
      return this.state
    }

    let o = {}
    Object.assign(o, this.state, v)
    this.setState(o)
    console.log("update", o)
  }

  render() {
    const t = this, s = t.state, callBack = o => t.update(o);
    return <Volumes hostname="ida" browser={callBack}/>
  }

}

export default withRouter(BrowsePage);
