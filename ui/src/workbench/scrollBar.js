import React, {Component} from 'react';

import ScrollIcon from '../../src/workbench/scroll.svg';

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
        <div className="scrollSlider">
          <div className="slider"/>
        </div>
        <ScrollIcon className="dec"/>
        <ScrollIcon className="inc"/>
      </div>)
  }
}

export default ScrollBar;
