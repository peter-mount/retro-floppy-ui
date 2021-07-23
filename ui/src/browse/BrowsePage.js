import React, {Component} from 'react';

import {withRouter} from 'react-router';
import Volumes from "./volumes";

class BrowsePage extends Component {

  constructor(props) {
    super(props);
    this.state = {options: []};
  }

  componentDidMount() {
    this.setState({options: []});
  }

  render() {
    const t = this;
    return (<div className="browseOuter">
      <Volumes/>
    </div>);
  }

}

export default withRouter(BrowsePage);
