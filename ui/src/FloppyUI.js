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

  componentDidMount() {
    const t = this;
    let url = (location.protocol === 'http:' ? 'ws:' : 'wss:') + '//' + document.domain + '/ws'
    console.log("WS connect", url)
    t.socket = new WebSocket(url);
    t.socket.addEventListener("open", e => {
      console.log("Open")
      t.socket.send("hello server!")
    })
    t.socket.addEventListener("message", e => {
      console.log("Received", e.data)
    })
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
              <MountedVolumes/>
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

