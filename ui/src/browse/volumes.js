import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faServer} from '@fortawesome/free-solid-svg-icons';
import Volume from "./volume";
import Window from "../workbench/window";

class Volumes extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const t = this, s = t.state;
    this.refresh()
  }

  refresh() {
    const t = this, s = t.state;

    let url = '/api/list';

    fetch(url)
      .then(res => res.json())
      .then(f => t.update(t, f))
      .catch(e => {
        console.error(url, e)
      })
  }

  update(t, f) {
    const s = t.state;
    f.sort()
    t.setState({
      volumes: f
    });
  }

  render() {
    const t = this, p = t.props, s = t.state;

    let volumes = null;

    if (s.volumes) {
      volumes = s.volumes
        .map((f, i) => {
          return <Volume key={f} name={f} browser={p.browser}/>
        })
    }

    return (
      <Window className="volumes" title="File Explorer">
        <div className="folder">
          <span>
            <FontAwesomeIcon icon={faServer}/>
            <span className="fileLabel">{p.hostname}</span>
          </span>
          <div>{volumes}</div>
        </div>
      </Window>);
  }

}

export default Volumes;
