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
import Folder from "./volume/folder";

const TypeFolder = 1,
  TypeDisk = 2;

class FloppyUI extends Component {

  constructor(props) {
    super(props);
    this.state = {
      icons: {},
      windows: [],
      wid: 0, // WindowId sequence
    }
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    const t = this, s = t.state;

    fetch("/api/status")
      .then(res => res.json())
      .then(f => t.updateStatus(f))
      .catch(e => {
        console.error("status", e)
      })
  }

  updateStatus(f) {
    const icons = {}
    Object.keys(f.disk)
      .forEach((d, s) => {
        icons['icon:' + d] = {
          key: d,
          name: d,
          icon: amDisk,
          path: d + "/"
        }
      })

    this.setState(Object.assign({}, this.state, {
      status: f,
      icons: icons,
    }))
  }

  touchState() {
    this.setState(Object.assign({}, this.state, {update: new Date()}))
  }

  render() {
    const t = this,
      s = t.state,
      status = s.status,
      title = status ? status.host.hostname + " - " + status.host.computer : "";

    console.log("fui.state", s)

    let children = [];

    Object.keys(s.icons)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((k) => {
        const i = s.icons[k]
        children.push(<Icon key={k} name={i.name} icon={i.icon} onDoubleClick={e => t.openFolder(i, e)}/>)
      })

    s.windows
      .map(w => {
        switch (w.type) {
          case TypeFolder:
            return <Folder path={w.path} title={w.title} x={w.x} y={w.x} w={w.w} h={w.h} wb={t}/>
        }
      })
      .forEach(w => children.push(w))

    //windows.push(<BrowseLoader key={'browser'}/>)

    return (
      <Workbench>
        <WorkbenchTitle>{title}</WorkbenchTitle>
        <WorkbenchBody>{children}</WorkbenchBody>
      </Workbench>
    )
  }

  openFolder(icon, e) {
    console.log("Open folder", icon)
    if (icon.window) {
      // TODO bring window to front?
    } else {
      const t = this, s = t.state, w = this.state.windows, key = "window:" + icon.path;
      icon.window = key;
      w.push({
        id: s.wid, // Window ID
        key: key,
        x: 100, y: 100, // TODO allocate a new location not at same place
        w: 300, h: 200,
        title: icon.name,
        path: icon.path,
        type: TypeFolder,
      })

      this.setState(Object.assign({}, s, {
        windows: w,
        wid: s.wid + 1
      }))

      this.touchState()
    }
  }

}

export default FloppyUI;

