import React, {Component} from 'react';

// The IEC units, using *iB as we use old school 1024 based units but to
// stop any confusion when dealing with disk space in 1000 based units.
// Blame marketeers in screwing things up ;-)
// First unit is for bytes so don't show a unit
const units = ["", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

class Disksize extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const p = this.props;
    let i = 0, v = p.size;
    while (v >= 1024 && i < units.length) {
      i = i + 1
      v = v / 1024
    }

    return <span>{Math.floor(100 * v) / 100} {units[i]}</span>
  }
}

export default Disksize;
