import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

import '../css/App.css';
import '../css/materialicons.css';
import '../css/floppyui.css';

// The loaders for each route
import BrowseLoader from "./loaders/BrowseLoader";
import Diskstatus from "./util/diskstatus";

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
    const t = this, s = t.state;

    if (s) {
      return (
        <div className="uiOuter">
          <div className="title">{s.host.hostname} - {s.host.computer}</div>
          <div className="statusBar">
            <Diskstatus disk={s.disk}/>
          </div>
          <div className="toolbar">
            Toolbar here
          </div>
          <BrowserRouter>
            <div>
              <Route component={BrowseLoader} exact path='/'/>
            </div>
          </BrowserRouter>
          <div className="diskRight">
            Disk mount details
          </div>
        </div>
      )
    }

    return (
      <div className="uiOuter"></div>
    )
  }

}

export default FloppyUI;

