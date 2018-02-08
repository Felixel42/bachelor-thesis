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

// Blockchain stuff
import store from '../../../store'
const contract = require('truffle-contract')

// Get Compiled Json templates to create contracts
// And To Interact with the smart contract
import WaterMeterServiceContract from '../../../../build/contracts/WaterMeterService.json'
import AuthenticationContract from '../../../../build/contracts/Authentication.json'

class Billing extends Component {
  constructor(props) {
    super(props);

    let web3 = store.getState().web3.web3Instance;
    
    // prepare Template to interact with Auth contract
    var _authenticationTemplate = contract(AuthenticationContract);
    _authenticationTemplate.setProvider(web3.currentProvider);
    
    // prepare Template to deploy a new WaterMeterService Contract
    var _waterMeterServiceTemplate = contract(WaterMeterServiceContract);
    _waterMeterServiceTemplate.setProvider(web3.currentProvider);
  
    //placeholder for selection of customer
    var emptyrow = [];
    emptyrow.push(
        <option key="0" value="0">---</option>
    )

    this.state = {
      customers: emptyrow,
      outstandingPayments: [],
      payedBills: [],
      alert: false,
      web3Instance: web3,
      authenticationTemplate: _authenticationTemplate,
      waterMeterServiceTemplate: _waterMeterServiceTemplate,
    }
    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidMount() {
    this.getCustomerID();
  }

  getCustomerID() {
    let web3 = this.state.web3Instance;
    // Get Address of already deployed Authentication Contract
    // needed in combination with already deployed contracts
    let address = store.getState().user.data.smartContractAddress;

    // Double-check web3's status.
    if (typeof web3 !== 'undefined') {
      const authentication = this.state.authenticationTemplate;
      //get current ethereum wallet
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }  
        authentication.at(address).then((instance) => {
          instance.getCurrentCustomerId({from: coinbase})
          .then((result) => {
            for(let i = 1; i<= result.valueOf(); i++) {
              var savedState = this.state.customers.slice();
              savedState.push(
                <option key={i} value={i}>{i}</option>
              )
              this.setState({customers: savedState});
            }
          });
        });
      });
    } else {
      console.error("web3 undefined at contract creation")
    }
  }

  handleClick(e) {
    e.preventDefault();
    let web3 = this.state.web3Instance;
    // Get Address of already deployed Authentication Contract
    // needed in combination with already deployed contracts
    let address = store.getState().user.data.smartContractAddress;

    var id = this.hf_selectCustomer.value;
    if(id === "0") {
      this.setState({alert: true});
      return;
    }

    var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate; 
    var savedName;
    var savedInstance;

    this.setState({outstandingPayments: [], payedBills: []})

    // Double-check web3's status
    if (typeof web3 !== 'undefined') {
      const authentication = this.state.authenticationTemplate;
      //get current ethereum wallet
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }  
        authentication.at(address).then((instance) => {
          instance.getCredentialsForCustomer(id,{from: coinbase})
          .then((result) => {
            savedName = result[0];
            waterMeterServiceTemplate.at(result[2]).then((instance) => {
              savedInstance = instance;
              savedInstance.getNumberOfBillings()
              .then((result) => {
                  for(let i = 1; i <= result.valueOf();i++) {
                    let savedObj = {id: i, name: savedName, year: "", month: "", consumption: "", amount:""};
                    savedInstance.getBillForBillId(i)
                    .then((result) => {
                      savedObj.year = result[0].valueOf();
                      savedObj.month = result[1].valueOf();
                      savedObj.consumption = result[2].valueOf();
                      let ether = web3.fromWei(result[3],'ether');
                      savedObj.amount = ether.valueOf();
      
                      if(result[4] === false) {
                        let savedrows = this.state.outstandingPayments.slice();
                        savedrows.push(savedObj);
                        this.setState({outstandingPayments: savedrows})
                      } else {
                        let savedrows = this.state.payedBills.slice();
                        savedrows.push(savedObj);
                        this.setState({payedBills: savedrows})
                      }
                    })
                  }
              })
            });
          });
        });
      });
    } else {
      console.error("web3 undefined at contract creation")
    }
  }

  //Helper Function to compute the last day of a given month
  daysInMonth(year, month) {
    return new Date(year, month+2, 0).getDate();
  }

  handleBillingClick(e) {
    e.preventDefault();
    let web3 = this.state.web3Instance;
    // Get Address of already deployed Authentication Contract
    // needed in combination with already deployed contracts
    let address = store.getState().user.data.smartContractAddress;

    var selectedCustomer = this.hf_selectCustomer.value;
    var selectedYear = this.hf_selectYear.value;
    var selectedMonth = this.hf_selectMonth.value;
    var lastDayOfMonth = this.daysInMonth(selectedYear, selectedMonth);

    if(selectedCustomer === "0") {
      this.setState({alert: true});
      return;
    }

    var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate; 
    var savedName;
    var savedInstance;

    // Double-check web3's status
    if (typeof web3 !== 'undefined') {
      const authentication = this.state.authenticationTemplate;
      //get current ethereum wallet
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }  
        authentication.at(address).then((instance) => {
          instance.getCredentialsForCustomer(selectedCustomer,{from: coinbase})
          .then((result) => {
            waterMeterServiceTemplate.at(result[2]).then((instance) => {
              savedInstance = instance;
              savedInstance.createBillForMonth(selectedYear, selectedMonth, lastDayOfMonth, {from: coinbase})
            });
          });
        });
      });
    } else {
      console.error("web3 undefined at contract creation")
    }
  }

  handleReceivePaymentClick(e) {
    e.preventDefault();
    var selectedCustomer = this.hf_selectCustomer.value;

    let web3 = this.state.web3Instance;
    // Get Address of already deployed Authentication Contract
    // needed in combination with already deployed contracts
    let address = store.getState().user.data.smartContractAddress;

    var selectedCustomer = this.hf_selectCustomer.value;
    var selectedYear = this.hf_selectYear.value;
    var selectedMonth = this.hf_selectMonth.value;
    var lastDayOfMonth = this.daysInMonth(selectedYear, selectedMonth);

    if(selectedCustomer === "0") {
      this.setState({alert: true});
      return;
    }

    var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate; 
    var savedName;
    var savedInstance;

    // Double-check web3's status
    if (typeof web3 !== 'undefined') {
      const authentication = this.state.authenticationTemplate;
      //get current ethereum wallet
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }  
        authentication.at(address).then((instance) => {
          instance.getCredentialsForCustomer(selectedCustomer,{from: coinbase})
          .then((result) => {
            waterMeterServiceTemplate.at(result[2]).then((instance) => {
              savedInstance = instance;
              savedInstance.withDrawFunds({from: coinbase})
            });
          });
        });
      });
    } else {
      console.error("web3 undefined at contract creation")
    }
  }

  onDismiss() {
    this.setState({alert: false})
  }

  render() {
    return (
      <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <strong>Abrechnungen erstellen/Zahlungen einsammeln</strong>
            </CardHeader>
            <CardBlock>
            <Form action="" method="post" className="form-horizontal">
                <Row>
                  <Col>
                    <FormGroup row>
                    <Col md="4">
                      <Label htmlFor="hf_selectCustomer">Kundennummer</Label>
                    </Col>
                    <Col xs="12" md="8">
                      <Input type="select" name="hf_selectCustomer" id="hf_selectCustomer" getRef={(input) => this.hf_selectCustomer = input} onClick={(e) => this.handleClick(e)}>                        
                        {this.state.customers}
                      </Input>
                        <span className="help-block">Bitte einen Kunden auswählen</span>
                    </Col>
                  </FormGroup>
                  </Col>
                </Row>
              </Form>
            <Form action="" method="post" className="form-horizontal">
                <Row>
                  <Col>
                    <FormGroup row>
                    <Col md="4">
                      <Label htmlFor="hf_selectYear">Jahr</Label>
                    </Col>
                    <Col xs="12" md="8">
                      <Input type="select" name="hf_selectYear" id="hf_selectYear" getRef={(input) => this.hf_selectYear = input}>                        
                        <option value="2017">2017</option>
                        <option value="2018">2018</option>
                        <option value="2019">2019</option>
                        <option value="2020">2020</option>
                      </Input>
                    </Col>
                  </FormGroup>
                  </Col>
                </Row>
            </Form>
            <Form action="" method="post" className="form-horizontal">
                <Row>
                  <Col>
                    <FormGroup row>
                    <Col md="4">
                      <Label htmlFor="hf_selectMonth">Monat</Label>
                    </Col>
                    <Col xs="12" md="8">
                      <Input type="select" name="hf_selectMonth" id="hf_selectMonth" getRef={(input) => this.hf_selectMonth = input}>                        
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </Input>
                    </Col>
                  </FormGroup>
                  </Col>
                </Row>
                <Alert color="danger" isOpen={this.state.alert} toggle={this.onDismiss}>
                    <strong>Kein Kunden ausgewählt</strong> Bitte Kunde auswählen
                </Alert>
              </Form>
            </CardBlock>
            <CardFooter>
                <Button type="submit" size="sm" color="danger" onClick={(e) => this.handleBillingClick(e)}>Abrechnen</Button>
                <Button type="submit" size="sm" color="success" onClick={(e) => this.handleReceivePaymentClick(e)}>Geld erhalten</Button>
            </CardFooter>
          </Card>
        </Col>
        <Col>
          <Card>
              <CardHeader>
                Ausstehende Zahlungen
              </CardHeader>
              <CardBlock className="card-body">
                <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                  <thead className="thead-default">
                  <tr>
                    <th className="text-center">Rechnungsnummer</th>
                    <th className="text-center">Kundenname</th>
                    <th className="text-center">Jahr</th>
                    <th className="text-center">Monat</th>
                    <th className="text-center">Verbrauch</th>
                    <th className="text-center">Betrag (ETH)</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.state.outstandingPayments.sort((a,b) => a.id - b.id).map(result =>
                      <tr key={result.id}>
                        <td className="text-center">{result.id}</td>
                        <td className="text-center">{result.name}</td>
                        <td className="text-center">{result.year}</td>
                        <td className="text-center">{result.month}</td>
                        <td className="text-center">{result.consumption}</td>
                        <td className="text-center">{result.amount}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </CardBlock>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                Bezahlte Abrechnungen
              </CardHeader>
              <CardBlock className="card-body">
                <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                  <thead className="thead-default">
                  <tr>
                    <th className="text-center">Rechnungsnummer</th>
                    <th className="text-center">Kundenname</th>
                    <th className="text-center">Jahr</th>
                    <th className="text-center">Monat</th>
                    <th className="text-center">Verbrauch</th>
                    <th className="text-center">Betrag (ETH)</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.state.payedBills.sort((a,b) => a.id - b.id).map(result =>
                      <tr key={result.id}>
                        <td className="text-center">{result.id}</td>
                        <td className="text-center">{result.name}</td>
                        <td className="text-center">{result.year}</td>
                        <td className="text-center">{result.month}</td>
                        <td className="text-center">{result.consumption}</td>
                        <td className="text-center">{result.amount}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </CardBlock>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Billing;
