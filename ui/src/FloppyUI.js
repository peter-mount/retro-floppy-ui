import React, {Component} from 'react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/App.css';
//import '../css/materialicons.css';
import '../css/floppyui.css';

import {faPowerOff} from '@fortawesome/free-solid-svg-icons/faPowerOff';
import MountedVolumes from "./volume/mountedVolumes";

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
        h[k].push(o)
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

  componentDidMount() {
    const t = this;

    let url = (location.protocol === 'http:' ? 'ws:' : 'wss:') + '//' + document.domain + '/ws'
    console.log("WS connect", url)
    t.socket = new WebSocket(url);
    t.socket.addEventListener("message", e => t.handleWS(e))
    /*
        t.socket.addEventListener("open", e => {
          console.log("Open")
          // TODO for now send a message that the front end has connected. Probably will remove this later.
          t.socket.send(JSON.stringify({id: "fe"}))
        })
    */
  }

  render() {
    const t = this,
      s = t.state;

    return (
      <div>
        <Navbar bg="light" variant="light" expand="lg">
          <Container>
            <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#link">Link</Nav.Link>
                <NavDropdown title="Link" id="navbarScrollingDropdown">
                  <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
                  <NavDropdown.Divider/>
                  <NavDropdown.Item href="#action5">Something else here</NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="#" disabled>
                  Link
                </Nav.Link>
              </Nav>
              <Nav>
                <NavDropdown title={<span><FontAwesomeIcon icon={faPowerOff}/></span>}>
                  <NavDropdown.Item href="#action3">Shutdown system</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">Reboot system</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container>
          <Row>
            <Col>
              <MountedVolumes ws={t}/>
            </Col>
            <Col>2</Col>
            <Col>3</Col>
          </Row>
        </Container>
      </div>
    )
  }
}

export default FloppyUI;

