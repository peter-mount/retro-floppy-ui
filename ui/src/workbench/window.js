import React, {Component} from 'react';

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
    const t = this, p = t.props, s = t.state;
    return (
      <div className={"window " + p.className}
           style={{left: s.x, top: s.y}}
           draggable={s.drag}
           onDrag={e => t.drag(e, true)}
           onDragEnd={e => t.drag(e, false)}
      >
        <div className="windowTitle" onMouseDown={e => t.dragStart(e)}>{p.title}</div>
        <div className="windowBody">{p.children}</div>
      </div>
    );
  }

  dragStart(e) {
    const t = this, s = t.state;
    this.setState(Object.assign({}, s, {
      drag: true,
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
}

export default Window;
