import React, {Component} from "react";
import {
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardBlock,
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  Table,
  Alert
} from "reactstrap";

// Get Compiled Json templates to create contracts
// And To Interact with the smart contract
import AuthenticationContract from '../../../../build/contracts/Authentication.json'
import WaterMeterServiceContract from '../../../../build/contracts/WaterMeterService.json'

// Blockchain stuff
import store from '../../../store'
const contract = require('truffle-contract')

// Content of Customer overview table
import TableContent from './TableContent';

class Administration extends Component {
  constructor(props) {
    super(props);

    let web3 = store.getState().web3.web3Instance;

    // prepare Template to interact with Auth contract
    var _authenticationTemplate = contract(AuthenticationContract);
    _authenticationTemplate.setProvider(web3.currentProvider);

    // prepare Template to deploy a new WaterMeterService Contract
    var _waterMeterServiceTemplate = contract(WaterMeterServiceContract);
    _waterMeterServiceTemplate.setProvider(web3.currentProvider);

    var alertOptions = {
      success: false,
      error: false
    };

    this.state = {
      web3Instance: web3,
      authenticationTemplate: _authenticationTemplate,
      waterMeterServiceTemplate: _waterMeterServiceTemplate,
      alerts: alertOptions
    };
    this.onDismiss = this.onDismiss.bind(this);
  }

  handleClick(e){
    // How to get Inputvalue: https://github.com/reactstrap/reactstrap/issues/311
    //Validate if a field is Empty, src: https://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript 
    String.prototype.isEmpty = function() {
      return (this.length === 0 || !this.trim());
    };
    var name = this.hf_name.value; //kann einfach hinzugefügt werden
    var address = this.hf_address.value; //works
    var meterAddress = this.hf_meteraddress.value;
    var price = this.hf_price.value; //works with web3.toWei(price, 'ether')
    var startdate = this.hf_startdate.value
    var enddate = this.hf_enddate.value

    //Activate Alert If a field is empty
    if(name.isEmpty() || address.isEmpty() || meterAddress.isEmpty() || startdate.isEmpty() || enddate.isEmpty()) {
      this.setState({alerts: {success: false, error: true}});
      return;
    } else {
      // prepare values for transmission
      var priceWei = this.state.web3Instance.toWei(price, 'ether');
      var dates = [startdate.substring(0,4), startdate.substring(5,7), startdate.substr(8,10), enddate.substring(0,4), enddate.substring(5,7), enddate.substr(8,10)]

      // Get Address of already deployed Authentication Contract
      // needed in combination with already deployed contracts
      let authAddress = store.getState().user.data.smartContractAddress;
      var savedInstance;
      let web3 = this.state.web3Instance;
      var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate;
      // Double-check web3's status.
      if (typeof web3 !== 'undefined') {
        //get current ethereum wallet
        web3.eth.getCoinbase((error, coinbase) => {
            // Log errors, if any.
          if (error) {
            console.error(error);
          }  
          this.state.authenticationTemplate.at(authAddress).then((instance) => {
            savedInstance = instance;
            waterMeterServiceTemplate.new(meterAddress, coinbase, address, priceWei, dates, {from: coinbase}).then((contractInstance) => {
              instance.registerCustomer(name, address, contractInstance.address, {from: coinbase}).then((result) => {
                console.log("Registered")  
                this.setState({alerts: {success: true, error: false}});
                  // Add row dynamically needs to be implemented setAddRow={click => this.clickChild = click}
              }).catch(function(result) {
                  console.error("Fehler bei der Registrierung");
              });
            }).catch(function(result){
              console.error("Fehler bei der Contract Anlage")
            });
          });
        });
      } else {
        console.error("web3 undefined at contract creation")
      }
    }
  }

  onDismiss() {
    this.setState({alerts: {success: false, error: false}});
  }

  render() {
    return (
      <div className="animated fadeIn">
          <Row>
            <Card>
              <CardHeader>
                <strong>Kunden/Vertragsanlage</strong> Formular
              </CardHeader>
              <CardBlock className="card-body">
                <Form action="" method="post" className="form-horizontal">
                  <Row>
                    <Col>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="hf_name">Name</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="text" id="hf_name" name="hf_name" placeholder="Enter Name..." getRef={(input) => this.hf_name = input}/>
                          <span className="help-block">Please enter the customer's name</span>
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="hf_address">Adresse</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="text" id="hf_address" name="hf_address" placeholder="0x007A50665Db1080eb4aEAB9A1798a345D6B34314" getRef={(input) => this.hf_address = input}/>
                          <span className="help-block">Please enter a public Ethereum Address</span>
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="hf_meteraddress">Smart Meter Adresse</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="text" id="hf_meteraddress" name="hf_meteraddress" placeholder="0x719dd14f936d136fce31e5449ee629e7ad2bd73c" getRef={(input) => this.hf_meteraddress = input}/>
                          <span className="help-block">Please enter a public Ethereum Address</span>
                        </Col>
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="hf_price">Preis pro Liter</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="select" name="hf_price" id="hf_price" getRef={(input) => this.hf_price = input}>
                            <option value="0.004">0.004</option>
                            <option value="0.00008">0.00008</option>
                          </Input>
                            <span className="help-block">Einheit: ETH</span>
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="hf_startdate">Startdatum</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="date" id="hf_startdate" name="hf_startdate" getRef={(input) => this.hf_startdate = input}/>
                          <span className="help-block">Please enter a start date</span>
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="hf_enddate">Enddatum</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="date" id="hf_enddate" name="hf_enddate" getRef={(input) => this.hf_enddate = input}/>
                          <span className="help-block">Please enter an end date</span>
                        </Col>
                    </FormGroup>
                    </Col>
                  </Row>
                  <Alert color="danger" isOpen={this.state.alerts.error} toggle={this.onDismiss}>
                    <strong>Fehlerhafte Eingabe!</strong> Bitte überprüfen ob alle Felder ausgefüllt sind.
                  </Alert>
                  <Alert color="success" isOpen={this.state.alerts.success} toggle={this.onDismiss}>
                    <strong>Anlage war Erfolgreich!</strong> Kunde wurde angelegt und neuer Vertrag erstellt. 
                  </Alert>
                </Form>
              </CardBlock>
              <CardFooter>
                <Button type="submit" size="sm" color="primary" onClick={(e) => this.handleClick(e)}><i className="fa fa-dot-circle-o"></i>Anlegen</Button>
              </CardFooter>
            </Card>
          </Row>
          <Row>
            <Card>
              <CardHeader>
                Kunden/Vertragsübersicht
              </CardHeader>
              <CardBlock className="card-body">
                <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                  <thead className="thead-default">
                  <tr>
                    <th className="text-center">Kunden-ID</th>
                    <th className="text-center">Name</th>
                    <th className="text-center">Vertragsadresse</th>
                    <th className="text-center">Preis (ETH)</th>
                    <th className="text-center">Start</th>
                    <th className="text-center">Ende</th>
                  </tr>
                  </thead>
                  <TableContent />
                </Table>
              </CardBlock>
            </Card>
          </Row>
      </div>
    )
  }
}

export default Administration;
