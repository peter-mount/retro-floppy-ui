import React, {Component} from 'react';
//import {faServer} from '@fortawesome/free-solid-svg-icons';
import {amDisk} from '../src/workbench/disk.svg';
import '../css/App.css';
import '../css/materialicons.css';
import '../css/floppyui.css';

// The loaders for each route
//import BrowseLoader from "./loaders/BrowseLoader";
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
      wid: 1, // initial WindowId sequence
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

    let children = [];

    Object.keys(s.icons)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((k) => {
        const i = s.icons[k]
        children.push(<Icon key={k} name={i.name} icon={i.icon} onDoubleClick={e => t.openFolder(i, e)}/>)
      })

    s.windows
      .map((w, z) => {
        switch (w.type) {
          case TypeFolder:
            return <Folder key={w.id}
                           id={w.id}
                           path={w.path}
                           title={w.title}
                           x={w.x} y={w.x} w={w.w} h={w.h}
                           z={z + 1}
                           wb={t}/>
          default:
            return null
        }
      })
      .filter(w => w != null)
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
    const t = this, s = t.state, w = s.windows, key = "window:" + icon.path;

    if (icon.window) {
      // If window still exists then pull to front
      // If not then ignore & open a new one
      const w1 = w.filter(w2 => w2.id === icon.window).reduce((p, c) => c, null)
      if (w1) {
        t.windowToFront(icon.window)
        return
      }
    }

    w.push({
      id: s.wid, // Window ID
      key: key,
      x: 100, y: 100, // TODO allocate a new location not at same place
      w: 300, h: 200,
      title: icon.name,
      path: icon.path,
      type: TypeFolder,
    })

    icon.window = s.wid;

    s.wid = s.wid + 1
    t.setState(Object.assign({}, s, {
      windows: w,
    }))

    this.touchState()
  }

  // Remove id from array.
  // a defaults to [] but is initial array to append existing windows to
  getWindowsExcept(id, a = []) {
    return this.state.windows
      .filter(w => w.id !== id)
      .reduce((p, c) => {
        p.push(c)
        return p
      }, a)
  }

  // Close window by removing from list
  closeWindow(id) {
    const t = this, s = t.state;
    t.setState(Object.assign({}, s, {
      windows: t.getWindowsExcept(id)
    }))
  }

  // Bring window forward
  windowToFront(id) {
    const t = this, s = t.state, wa = s.windows;

    // Do nothing if we are already on top
    if (wa.length > 0 && wa[wa.length - 1].id === id) {
      return
    }

    const w = wa.filter(w => w.id === id).reduce((p, c) => c, null),
      a = t.getWindowsExcept(id)
    a.push(w);
    t.setState(Object.assign({}, s, {windows: a}))
  }

  // Send window to back
  windowToBack(id) {
    const t = this, s = t.state, wa = s.windows;

    // Do nothing if we are already on bottom
    if (wa.length > 0 && wa[0].id === id) {
      return
    }

    const w = wa.filter(w => w.id === id).reduce((p, c) => c, null)
    t.setState(Object.assign({}, s, {windows: t.getWindowsExcept(id, [w])}))
  }
}

export default FloppyUI;

