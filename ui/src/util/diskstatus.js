import React, {Component} from 'react';
import Disksize from "./disksize";

class Diskstatus extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this,
      p = t.props,
      d = p.disk,
      avail = d.Bavail * d.Bsize,
      used = (d.Blocks - d.Bavail) * d.Bsize,
      total = d.Blocks * d.Bsize;

    return <span><Disksize size={avail}/> free <Disksize size={used}/> used <Disksize size={total}/> total</span>
  }
}

export default Diskstatus;
