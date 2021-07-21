import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

import '../css/App.css';
import '../css/materialicons.css';

// The loaders for each route
import HomePageLoader from "./loaders/HomePageLoader";

class FloppyUI extends Component {

  /*
  componentDidMount() {
    getConfig()
  }
   */

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route component={HomePageLoader} exact path='/'/>
        </div>
      </BrowserRouter>
    )
  }

}

export default FloppyUI;

