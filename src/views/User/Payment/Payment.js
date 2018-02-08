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

class Payment extends Component {
  constructor(props) {
    super(props);

    let web3 = store.getState().web3.web3Instance;
      
    // prepare Template to deploy a new WaterMeterService Contract
    var _waterMeterServiceTemplate = contract(WaterMeterServiceContract);
    _waterMeterServiceTemplate.setProvider(web3.currentProvider);
  
    //address from the smart contract of a customer
    var smartContractAddress = store.getState().user.data.smartContractAddress;

    this.state = {
      outstandingPayments: [],
      payedBills: [],
      alert: false,
      web3Instance: web3,
      waterMeterServiceTemplate: _waterMeterServiceTemplate,
      smartContractAddress: smartContractAddress
    }
    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidMount() {
    this.fillTables();
  }

  fillTables() {
    var web3 = this.state.web3Instance;
    //get current ethereum wallet
    web3.eth.getCoinbase((error, coinbase) => {
      // Log errors, if any.
      if (error) {
        console.error(error);
      }  
      var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate;
      var savedInstance;
      waterMeterServiceTemplate.at(this.state.smartContractAddress).then((waterInstance) => {
        savedInstance = waterInstance;
        savedInstance.getNumberOfBillings()
        .then((result) => {
            for(let i = 1; i <= result.valueOf();i++) {
              let savedObj = {id: i, year: "", month: "", consumption: "", amount:""};
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
      })
    })
  }

  handlePayClick(e) {
    e.preventDefault();
    //Validate if a field is Empty, src: https://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript 
    String.prototype.isEmpty = function() {
      return (this.length === 0 || !this.trim());
    };
    var selectedBill = this.hf_selectBill.value;

    if( selectedBill.isEmpty()) {
      this.setState({alert: true});
      return;
    }

    var web3 = this.state.web3Instance;
    //get current ethereum wallet
    web3.eth.getCoinbase((error, coinbase) => {
      // Log errors, if any.
      if (error) {
        console.error(error);
      }  
      var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate;
      var savedInstance;
      waterMeterServiceTemplate.at(this.state.smartContractAddress).then((waterInstance) => {
        savedInstance = waterInstance;
        savedInstance.getBillForBillId(selectedBill)
        .then((result) => {
          savedInstance.payForBill(selectedBill, {from: coinbase, value: result[3]})
        })
      })
    })
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
                <strong>Abrechnungen bezahlen</strong>
              </CardHeader>
              <CardBlock>
              <Form action="" method="post" className="form-horizontal">
                  <Row>
                    <Col>
                      <FormGroup row>
                      <Col md="4">
                        <Label htmlFor="hf_selectBill">Rechnungsnummer</Label>
                      </Col>
                      <Col xs="12" md="8">
                        <Input type="select" name="hf_selectBill" id="hf_selectBill" getRef={(input) => this.hf_selectBill = input}>                        
                          {this.state.outstandingPayments.sort((a,b) => a.id - b.id).map(result =>
                            <option key={result.id} value={result.id}>{result.id}</option>
                          )}
                        </Input>
                          <span className="help-block">Bitte eine Rechnung auswählen</span>
                      </Col>
                    </FormGroup>
                    </Col>
                  </Row>
                  <Alert color="danger" isOpen={this.state.alert} toggle={this.onDismiss}>
                      <strong>Keine Rechnung ausgewählt</strong> Bitte Nummer auswählen
                  </Alert>
                </Form>
              </CardBlock>
              <CardFooter>
                  <Button type="submit" size="sm" color="danger" onClick={(e) => this.handlePayClick(e)}><i className="fa money"></i>Bezahlen</Button>
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

export default Payment;
