import React, {Component} from 'react';

import {withRouter} from 'react-router';

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
    return (<div className="volumeInfo browserRight">
      <span>Volume info "{p.volume}"</span>
    </div>);
  }

}

export default withRouter(VolumeInfo);
