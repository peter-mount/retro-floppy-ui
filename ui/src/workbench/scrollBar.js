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

    console.log("state", s)
    t.refreshScroll()
    if (p.body && p.body.current) {
      const c = p.body.current
      console.log(c.scrollLeft, c.scrollWidth, c.scrollTop, c.scrollHeight)
    }

    const v = p.vertical,
      vp = v ? s.vp : s.hp,
      vh = v ? s.vh : s.hh,
      tp = (vp ? vp : 0) + "%",
      ht = (vh ? vh : 100) + "%",
      bt = vp >= 1 ? "1px solid white" : "",
      bb = (vp + vh) < 99 ? "1px solid black" : "";
    let sliderStyle;
    if (v) {
      sliderStyle = {
        top: tp,
        height: ht,
        borderTop: bt,
        borderBottom: bb
      }
    } else {
      sliderStyle = {
        left: tp,
        width: ht,
        borderLeft: bt,
        borderRight: bb
      }
    }

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
        <ScrollIcon className="dec"/>
        <ScrollIcon className="inc"/>
      </div>)
  }

  refreshScroll() {
    const t = this,
      s = t.state,
      p = t.props,
      b = p.body,
      c = b ? b.current : null;
    if (b && b.current) {
      const vh = pc(c.clientHeight, c.scrollHeight),
        vp = pc(c.scrollTop, c.scrollHeight),
        hh = pc(c.clientWidth, c.scrollWidth),
        hp = pc(c.scrollLeft, c.scrollWidth)
      if (s.vh !== vh || s.vp !== vp || s.hh !== hh || s.hp !== hp) {
        t.setState(Object.assign({}, s, {vh: vh, vp: vp, hh: hh, hp: hp}))
      }
    }
  }
}

const pc = (c, t) => t ? 100 * c / t : 0;

export default ScrollBar;
