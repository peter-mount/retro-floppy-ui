import React, {Component} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/App.css';
import '../css/floppyui.css';

import {faPowerOff} from '@fortawesome/free-solid-svg-icons/faPowerOff';
import MountedVolumes from "./volume/mountedVolumes";
import MountedDisk from "./volume/mountedDisk";
import VolumeBrowser from "./browse/volumeBrowser";
import DiskInfo from "./disc/discViewer";
import LogViewer from "./util/LogViewer";
import {apiStatus, apiSystemReboot, apiSystemShutdown, apiSystemUpdate} from "./util/api";
import {newWebsocket} from "./util/ws";
import {ProgressBar} from "react-bootstrap";

const stepPC = (s, c) => c > 0 ? '' + Math.floor(s * 100 / c) + '%' : '0%';

class FloppyUI extends Component {

  constructor(props) {
    super(props);
    this.wshandlers = {};
    this.state = {};
  }

  // Register websocket message handler
  register(o) {
    const h = this.wshandlers;
    Object.keys(o).forEach(k => {
      if (typeof h[k] === "undefined") {
        h[k] = [o[k]]
      } else {
        h[k].push(o[k])
      }
    })
  }

  // Unregister websocket message handler
  // r function to remove, o array of id's to check
  unregister(r) {
    const h = this.wshandlers;
    Object.keys(h)
      .forEach(k => {
        h[k] = h[k].filter(v => v === r)
      })
  }

  handleWS(e) {
    e.data.split("\n").forEach(l => {
      let v = JSON.parse(l)
      let h = this.wshandlers[v.id]
      if (typeof h !== "undefined") {
        h.forEach(r => r(v))
      }
    })
  }

  broadcast(v) {
    this.socket.send(JSON.stringify(v))
  }

  componentDidMount() {
    const t = this;
    t.wsHandler = e => t.handleWSMessage(e)
    t.register({
      notice: t.wsHandler,
    })
    setTimeout(() => t.connectWS(), 100)
  }

  componentWillUnmount() {
    this.unregister(this.wsHandler)
  }

  handleWSMessage(e) {
    const t = this;
    switch (e.id) {
      case "notice":
        t.setState({
          notice: e,
          update: new Date()
        });
        return
    }
  }

  connectWS() {
    const t = this;
    clearTimeout(t.wsTimer);

    // issue /api/status call - this will fail quicker than ws if the server is offline
    // but apache is up
    apiStatus(
      response => {
        t.socket = newWebsocket(
          e => t.handleWS(e),
          e => {
            if (t.state && t.state.disconnected) {
              location.reload()
            }
          },
          e => t.failWS()
        )
      },
      e => t.failWS()
    )
  }

  failWS() {
    const t = this;
    t.setState({disconnected: true})
    t.wsTimer = setTimeout(() => t.connectWS(), 5000)
  }

  render() {
    const t = this,
      s = t.state,
      modal = s.disconnected
        ? <Modal show={true} backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title>Server disconnected</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>This page will reload if the server comes back online.</p>
          </Modal.Body>
        </Modal>
        : s.notice && s.notice.text
          ? <Modal show={true}>
            <Modal.Header closeButton>
              <Modal.Title>{s.notice.title ? s.notice.title : "Notice"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {s.notice.text}
              {s.notice.stepCount > 1
                ? <div><ProgressBar animated
                                    variant="success"
                                    label={stepPC(s.notice.step, s.notice.stepCount)}
                                    now={s.notice.step}
                                    max={s.notice.stepCount}/></div>
                : null}
            </Modal.Body>
            {s.notice.subText ? <Modal.Footer>{s.notice.subText}</Modal.Footer> : null}
          </Modal>
          : null;

    return (
      <div>
        <Navbar bg="light" variant="light" expand="sm">
          <Container>
            <Navbar.Brand href="#home">Retro-Floppy UI</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
              </Nav>
              <Nav>
                <NavDropdown align={'end'} title={<span><FontAwesomeIcon icon={faPowerOff}/></span>}>
                  <NavDropdown.Item>Logout</NavDropdown.Item>
                  <NavDropdown.Divider/>
                  <NavDropdown.Item onSelect={apiSystemUpdate}>Update system</NavDropdown.Item>
                  <NavDropdown.Item onSelect={apiSystemReboot}>Reboot system</NavDropdown.Item>
                  <NavDropdown.Item onSelect={apiSystemShutdown}>Shutdown system</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {modal}
        <Container>
          <Row>
            <Col xs={6}>
              <MountedVolumes ws={t}/>
            </Col>
            <Col xs={6}>
              <MountedDisk ws={t}/>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <VolumeBrowser ws={t}/>
            </Col>
            <Col xs={6}>
              <DiskInfo ws={t}/>
              <LogViewer ws={t}/>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

export default FloppyUI;

