import React, {Component} from 'react';

import {withRouter} from 'react-router';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import config from 'react-global-configuration';
import Folder from "./folder";

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
      <div>
        <Folder path="" open={true} root={true}/>
      </div>
    </div>);
  }

}

export default withRouter(BrowsePage);
