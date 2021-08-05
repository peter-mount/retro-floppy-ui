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
import {apiStatus, apiSystemUpdate} from "./util/api";
import {newWebsocket} from "./util/ws";

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
      console.log("WS", v)
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
            <p>The server has disconnected. Press Reload to try to reconnect.</p>
            <p>If the server comes back online this page will reload.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => location.reload()}>Reload</Button>
          </Modal.Footer>
        </Modal>
        : s.notice && s.notice.text
          ? <Modal show={true}>
            <Modal.Header closeButton>
              <Modal.Title>{s.notice.title ? s.notice.title : "Notice"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{s.notice.text}</Modal.Body>
            {s.notice.subText ? <Modal.Footer>{s.notice.subText}</Modal.Footer> : null}
          </Modal>
          : null;

    console.log(modal);
    console.log(s);
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
                <NavDropdown title={<span><FontAwesomeIcon icon={faPowerOff}/></span>}>
                  <NavDropdown.Item>Logout</NavDropdown.Item>
                  <NavDropdown.Divider/>
                  <NavDropdown.Item onSelect={apiSystemUpdate}>Update system</NavDropdown.Item>
                  <NavDropdown.Item>Shutdown system</NavDropdown.Item>
                  <NavDropdown.Item>Reboot system</NavDropdown.Item>
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

