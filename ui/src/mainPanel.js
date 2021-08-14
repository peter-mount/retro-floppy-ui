import React, {Component} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import MountedVolumes from "./volume/mountedVolumes";
import MountedDisk from "./volume/mountedDisk";
import VolumeBrowser from "./browse/volumeBrowser";
import DiskInfo from "./disc/discViewer";
import LogViewer from "./util/LogViewer";

class MainPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this,
      p=t.props,
      ws = p.ws;

    return (
        <Container>
          <Row>
            <Col xs={6}>
              <MountedVolumes ws={ws}/>
            </Col>
            <Col xs={6}>
              <MountedDisk ws={ws}/>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <VolumeBrowser ws={ws}/>
            </Col>
            <Col xs={6}>
              <DiskInfo ws={ws}/>
              <LogViewer ws={ws}/>
            </Col>
          </Row>
        </Container>
    )
  }
}

export default MainPanel;

