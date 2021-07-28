import React, {Component} from 'react';

const SCROLL_BOX_MIN_HEIGHT = 20;

class ScrollBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      className: props.vertical ? "vertScroll" : "horizScroll",
    }
  }

  render() {
    const t = this, s = t.state, p = t.props;

    if (p.body && p.body.current) {
      const c = p.body.current
      console.log(c.scrollLeft, c.scrollWidth, c.scrollTop, c.scrollHeight)
    }
    return (
      <div className={s.className} ref={t.scrollHostRef}>
        <div className="scrollSlider"></div>
      </div>)
  }
}

export default ScrollBar;
