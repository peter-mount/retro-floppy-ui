import React, {Component} from 'react';

import ScrollIcon from '../../src/workbench/scroll.svg';

class ScrollBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      className: props.vertical ? "vertScroll" : "horizScroll",
    }
  }

  componentDidMount() {
    this.refreshScroll()
  }

  render() {
    const t = this, s = t.state, p = t.props;

    t.refreshScroll()

    const v = p.vertical,
      vp = v ? s.vp : s.hp,
      vh = v ? s.vh : s.hh,
      tp = (vp ? vp : 0) + "%",
      ht = (vh ? vh : 100) + "%",
      bt = vp >= 1 ? "1px solid white" : "",
      bb = (vp + vh) < 99 ? "1px solid black" : "";

    return (
      <div className={s.className} ref={t.scrollHostRef}>
        <div className="scrollSlider">
          <div className="slider" style={v ? {
            top: tp,
            height: ht,
            borderTop: bt,
            borderBottom: bb
          } : {
            left: tp,
            width: ht,
            borderLeft: bt,
            borderRight: bb
          }}/>
        </div>
        <ScrollIcon className="dec" onClickCapture={e => t.decrement(e)}/>
        <ScrollIcon className="inc" onClickCapture={e => t.increment(e)}/>
      </div>)
  }

  decrement(e) {
    this.decInc(-10)
  }

  increment(e) {
    this.decInc(10)
  }

  decInc(d) {

    const t = this,
      s = t.state,
      p = t.props,
      v = p.vertical,
      c = p.body ? p.body.current : null,
      op = v ? s.vp : s.hp,
      oh = v ? s.vh : s.hh,
      np = Math.max(0, Math.min(100 - oh, op + d));

    if (v) {
      c.scrollTop = np * c.scrollHeight / 100
      t.setState(Object.assign({}, s, {vp: np}))
    } else {
      c.scrollLeft = np * c.scrollWidth / 100
      t.setState(Object.assign({}, s, {hp: np}))
    }
  }

  refreshScroll() {
    const t = this,
      s = t.state,
      p = t.props,
      b = p.body,
      c = b ? b.current : null;
    if (c) {
      const vh = pc(c.clientHeight, c.scrollHeight),
        vp = pc(c.scrollTop, c.scrollHeight),
        hh = pc(c.clientWidth, c.scrollWidth),
        hp = pc(c.scrollLeft, c.scrollWidth)
      if (s.vh !== vh || s.vp !== vp || s.hh !== hh || s.hp !== hp) {
        t.setState(Object.assign({}, s, {vh: vh, vp: vp, hh: hh, hp: hp}))
      }
    } else {
      clearTimeout(t.refreshTimer)
      t.refreshTimer = setTimeout(() => t.refreshScroll(), 125)
    }
  }
}

// Return the percentage of n/d
const pc = (n, d) => d ? 100 * n / d : 0;

export default ScrollBar;
