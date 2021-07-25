import React, {Component} from 'react';

import CloseGadget from "../../src/workbench/closeGadget.svg";
import DepthGadget from "../../src/workbench/depthGadget.svg";
import ResizeGadget from "../../src/workbench/resizeGadget.svg";

class Window extends Component {

  constructor(props) {
    super(props);
    this.state = {
      x: props.x ? props.x : 0,
      y: props.y ? props.y : 0,
      drag: false,
    }
  }

  render() {
    const t = this,
      p = t.props,
      s = t.state,
      styles = {},
      titles = [],
      body = p.resizable ?
        <div className="windowBody2">
          <div className="windowBody1">{p.children}</div>
          <div className="vertScroll"></div>
          <div className="horizScroll"></div>
          <ResizeGadget className="resizeGadget" onMouseDown={e => t.resizeStart(e)}/>
        </div>
        : <div className="windowBody">{p.children}</div>

    if (p.close) {
      titles.push(<CloseGadget className="closeGadget"/>)
      styles["margin-left"] = "calc(2em - 3px)"
    }

    titles.push(<span style={styles}>{p.title}</span>)

    if (p.depth == null || p.depth) {
      titles.push(<DepthGadget className="depthGadget"/>)
    }

    // Extends title text to fill remaining width
    styles.width = "calc(100% - " + ((titles.length - 1) * 2) + "em" + (p.close ? " + 3px" : "") + ")"

    let winstyles = {left: s.x, top: s.y}
    if (s.w && s.h) {
      winstyles.width = s.w
      winstyles.height = s.h
    }

    return (
      <div className={"window " + p.className}
           style={winstyles}
           draggable={s.drag}
           onDrag={e => t.drag(e, true)}
           onDragEnd={e => t.drag(e, false)}
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

  resizeStart(e) {
    const t = this, s = t.state, window = e.currentTarget.parentNode.parentNode;
    console.log(Object.assign({}, e))
    this.setState(Object.assign({}, s, {
      drag: true,
      resize: true,
      dx: s.x - e.clientX,
      dy: s.y - e.clientY,
      w: window.clientWidth,
      h: window.clientHeight
    }))
  }

  drag(e, drag) {
    if (e.clientX && e.clientY) {
      const t = this, s = t.state;
      if (s.resize) {
        this.setState(Object.assign({}, s, {
          w: Math.max(e.clientX + s.dx, 50) - s.x,
          y: Math.max(e.clientY + s.dy, 50) - s.y,
          drag: drag,
          resize: true
        }))
      } else {
        this.setState(Object.assign({}, s, {
          x: Math.max(e.clientX + s.dx, 0),
          y: Math.max(e.clientY + s.dy, 0),
          drag: drag,
        }))
      }
    }
  }

}

export default Window;
