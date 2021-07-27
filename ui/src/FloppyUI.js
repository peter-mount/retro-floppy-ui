import React, {Component} from 'react';
import {faServer} from '@fortawesome/free-solid-svg-icons';
import {amDisk} from '../src/workbench/disk.svg';
import '../css/App.css';
import '../css/materialicons.css';
import '../css/floppyui.css';

// The loaders for each route
import BrowseLoader from "./loaders/BrowseLoader";
import Workbench from "./workbench/workbench";
import WorkbenchTitle from "./workbench/workbenchTitle";
import WorkbenchBody from "./workbench/workbenchBody";
import Icon from "./workbench/icon";

class FloppyUI extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    const t = this, s = t.state;

    fetch("/api/status")
      .then(res => res.json())
      .then(f => t.setState(Object.assign({}, s, {status: f})))
      .catch(e => {
        console.error("status", e)
      })
  }

  render() {
    const t = this,
      s = t.state,
      status = s ? s.status : null,
      title = status ? status.host.hostname + " - " + status.host.computer : "";

    console.log("fui.state", s)

    let windows = [], icons = [];

    if (status) {
      Object.keys(status.disk)
        .forEach((d, s) => {
          icons.push(<Icon key={'icon:' + d} name={d} icon={amDisk}/>)
        })
    }

    //windows.push(<BrowseLoader key={'browser'}/>)

    return (
      <Workbench>
        <WorkbenchTitle>{title}</WorkbenchTitle>
        <WorkbenchBody>{icons}{windows}</WorkbenchBody>
      </Workbench>
    )
  }

}

export default FloppyUI;

