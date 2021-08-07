import React, {Component} from 'react';
import {parseFolder} from "./folder";
import {apiListFolder} from "../util/api";

// Volume handles the root folder in a volume.
class Volume extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this;
    setTimeout(() => t.refresh(), 100)
  }

  refresh() {
    const t = this, p = t.props;

    // Only refresh if we have a volume, undefined means none selected
    if (p.volume) {
      apiListFolder(p.volume, "", f => t.setState({file: f}))
    }
  }

  render() {
    const t = this,
      p = t.props,
      s = t.state;

    if (!s.file) {
      t.refresh()
    }

    const [dirs, files] = parseFolder(s, p)

    return <div>{dirs}{files}</div>
  }

}

export default Volume;
