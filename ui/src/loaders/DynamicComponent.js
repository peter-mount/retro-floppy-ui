import React, {Component} from 'react';
import Spinner from './spinner.svg';
import '../../css/spinner.css';

class DynamicComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      Component: null,
      spinner: false,
    }
  }

  componentDidMount() {
    const t = this,
      props = t.props,
      importer = props.import,
      // force spin=true to disable the spinner
      spin = true;//props.spin;

    // Need to yield the thread before calling so any animation can start
    setTimeout(() => {
      importer().then(module => {
        this.setState({Component: module.default});
      });
      if (!spin) {
        setTimeout(() => {
          if (t.state.Component === null) {
            this.setState({Component: null, spinner: true});
          }
        }, 1000)
      }
    }, 10)
  }

  render() {
    const {
      Component: Component,
      spinner: spinner
    } = this.state;

    return Component
      ? <Component/>
      : spinner
        ? <div id="spinner"><Spinner/></div>
        : <div></div>
  }
}

export default DynamicComponent
