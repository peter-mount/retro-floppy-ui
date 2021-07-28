import React, {Component, createRef} from 'react';

import CloseGadget from "../../src/workbench/closeGadget.svg";
import DepthGadget from "../../src/workbench/depthGadget.svg";
import ResizeGadget from "../../src/workbench/resizeGadget.svg";
import ScrollBar from "./scrollBar";

class Window extends Component {

  constructor(props) {
    super(props);
    this.bodyRef = createRef()
    this.state = {
      x: props.x ? props.x : 0,
      y: props.y ? props.y : 0,
      w: props.w ? props.w : 200,
      h: props.h ? props.h : 200,
      drag: false,
    }
  }

  scroll(e) {
    //console.log("scroll",Object.assign({},e))
    this.setState(Object.assign({}, this.state, {scroll: new Date()}))
  }

  render() {
    const t = this,
      p = t.props,
      s = t.state,
      styles = {},
      titles = [],
      body = p.resizable ?
        <div className="windowBody2">
          <div className="windowBody1" ref={t.bodyRef} onScroll={e => t.scroll(e)}>{p.children}</div>
          <ScrollBar vertical={true} body={t.bodyRef}/>
          <ScrollBar vertical={false} body={t.bodyRef}/>
          <ResizeGadget className="resizeGadget"
                        onMouseDown={e => t.resizeStart(e)}
                        onMouseMove={e => t.resize(e)}
                        onMouseUp={e => t.resizeEnd(e)}
                        onMouseLeave={e => t.resizeEnd(e)}/>
        </div>
        : <div className="windowBody">{p.children}</div>

    console.log("ref", t.bodyRef.current)
    if (p.close) {
      titles.push(<CloseGadget className="closeGadget" onClick={e => p.close(e)}/>)
      styles["margin-left"] = "calc(2em - 3px)"
    }

    titles.push(<span style={styles}>{p.title}</span>)

    // For now depthGadget is mandatory
    titles.push(<DepthGadget className="depthGadget" onClickCapture={e => t.windowToBack(e)}/>)

    // Extends title text to fill remaining width
    styles.width = "calc(100% - " + ((titles.length - 1) * 2) + "em" + (p.close ? " + 3px" : "") + ")"

    let winStyles = {left: s.x, top: s.y}
    if (s.w && s.h) {
      winStyles.width = s.w
      winStyles.height = s.h
    }
    if (p.z) {
      winStyles.zIndex = 1000 * p.z
    }

    return (
      <div className={"window " + (p.className ? p.className : "")}
           style={winStyles}
           draggable={s.drag}
           onDrag={e => t.drag(e, true)}
           onDragEnd={e => t.drag(e, false)}
           onClickCapture={e => t.windowToFront(e)}
      >
        <div className="windowTitle" onMouseDown={e => t.dragStart(e)}>{titles}</div>
        {body}
      </div>
    );
  }

  dragStart(e) {
    const t = this, s = t.state;
    this.setState(Object.assign({}, s, {
      drag: true,
      resize: false,
      dx: s.x - e.clientX,
      dy: s.y - e.clientY
    }))
  }

  drag(e, drag) {
    if (e.clientX && e.clientY) {
      const t = this, s = t.state;
      this.setState(Object.assign({}, s, {
        x: Math.max(e.clientX + s.dx, 0),
        y: Math.max(e.clientY + s.dy, 0),
        drag: drag,
      }))
    }
  }

  resizeStart(e) {
    const w = getWindow(e.currentTarget), b = w.getBoundingClientRect();
    this.setState(Object.assign({}, this.state, {
      resize: true,
      dx: b.width - (e.clientX - b.x),
      dy: b.height - (e.clientY - b.y),
    }))
  }

  resizeEnd(e) {
    this.setState(Object.assign({}, this.state, {resize: false}))
  }

  resize(e) {
    const t = this, s = t.state;
    if (s.resize) {
      const w = getWindow(e.currentTarget), b = w.getBoundingClientRect();
      this.setState(Object.assign({}, this.state, {
        w: Math.max(100, e.clientX - b.x + s.dx),
        h: Math.max(100, e.clientY - b.y + s.dy)
      }))
    }
  }

  windowToFront(e) {
    if (this.props.windowToFront) {
      this.props.windowToFront(e)
    }
  }

  windowToBack(e) {
    if (this.props.windowToBack) {
      this.props.windowToBack(e)
    }
  }
}

const getWindow = (e) => {
  while (e && e.classList.length > 0 && e.classList[0] !== 'window') {
    e = e.parentElement
  }
  return e
}

export default Window;
