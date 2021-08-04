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
    setTimeout(() => t.connectWS(), 100)
  }

  connectWS() {
    const t = this;
    clearTimeout(t.wsTimer);

    // issue /api/status call - this will fail quicker than ws if the server is offline
    // but apache is up
    fetch('/api/status')
      .then(response => {
        if (response.status !== 200) {
          console.log("status", response.status)
          t.failWS()
        } else {
          // Connect the websocket
          let url = (location.protocol === 'http:' ? 'ws:' : 'wss:') + '//' + document.domain + '/ws'
          console.log("WS connect", url)
          t.socket = new WebSocket(url);
          t.socket.addEventListener("message", e => t.handleWS(e))
          t.socket.addEventListener("open", e => {
            console.log("WS Open")
            if (t.state && t.state.modal) {
              location.reload()
            }
            //t.setState({modal: false})
            // TODO for now send a message that the front end has connected. Probably will remove this later.
            //t.socket.send(JSON.stringify({id: "fe"}))
          })
          t.socket.addEventListener("close", e => {
            console.log("WS closed")
            t.failWS()
          })
        }
      })
      .catch(e => {
        console.log("api failure")
        t.failWS()
      })
  }

  failWS() {
    const t = this;
    t.setState({modal: true})
    t.wsTimer = setTimeout(() => t.connectWS(), 5000)
  }

  render() {
    const t = this,
      s = t.state;

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
                  <NavDropdown.Item onSelect={e => t.updateSystem()}>Update system</NavDropdown.Item>
                  <NavDropdown.Item>Shutdown system</NavDropdown.Item>
                  <NavDropdown.Item>Reboot system</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Modal show={s.modal === true}
               backdrop="static"
               keyboard={false}>
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

  updateSystem() {
    fetch("/api/system/update")
      .catch(e => console.log(e))
  }
}

export default FloppyUI;

