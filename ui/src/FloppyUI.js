import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

import '../css/App.css';
import '../css/materialicons.css';
import '../css/floppyui.css';

// The loaders for each route
import BrowseLoader from "./loaders/BrowseLoader";

class FloppyUI extends Component {

  /*
  componentDidMount() {
    getConfig()
  }
   */

  render() {
    return (
      <div className="uiOuter">
        <div className="title">Header from config here</div>
        <div className="statusBar">
          15Gb free
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

}

export default FloppyUI;

