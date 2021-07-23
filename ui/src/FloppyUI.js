import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

import '../css/App.css';
import '../css/materialicons.css';
import '../css/floppyui.css';

// The loaders for each route
import BrowseLoader from "./loaders/BrowseLoader";
import Diskstatus from "./util/diskstatus";
import Workbench from "./workbench/workbench";
import WorkbenchStatus from "./workbench/workbenchStatus";
import WorkbenchBody from "./workbench/workbenchBody";

class FloppyUI extends Component {

  constructor(props) {
    super(props);
    this.state = null
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    const t = this;
    fetch("/api/status")
      .then(res => res.json())
      .then(f => t.setState(f))
      .catch(e => {
        console.error("status", e)
      })
  }

  render() {
    const t = this,
      s = t.state,
      status = s ? s.host.hostname + " - " + s.host.computer : "";

    return (
      <Workbench>
        <WorkbenchStatus>{status}</WorkbenchStatus>
        <WorkbenchBody>
          <BrowserRouter>
            <div>
              <Route component={BrowseLoader} exact path='/'/>
            </div>
          </BrowserRouter>
        </WorkbenchBody>
      </Workbench>
    )
  }

}

export default FloppyUI;

