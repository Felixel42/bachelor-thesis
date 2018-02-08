import React, {Component} from "react";
import {Container, Row, Col, Card, CardBlock, Button} from "reactstrap";
import { Route } from 'react-router-dom';

import LoginButtonContainer from '../../../components/Authentication/loginbutton/LoginButtonContainer';

class Login extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
                <Card className="p-4">
                  <CardBlock className="card-body">
                    <h1>Login</h1>
                    <p>Willkommen bei der <strong>Water Service DApp</strong> ihres Wasserversorgers!</p>
                    <br/>
                    <p className="text-muted">Um sich einzuloggen, müssen Sie nur auf den Login Button drücken. Daraufhin wird in Ihrem Ethereum Client/Metamask eine Transaktion erstellt, die Sie bestätigen müssen</p>
                    <Row>
                      <Col xs="6">
                      <LoginButtonContainer />
                      </Col>
                    </Row>
                  </CardBlock>
                </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
