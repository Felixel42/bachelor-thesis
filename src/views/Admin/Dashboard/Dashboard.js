import React, {Component} from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBlock,
  CardFooter,
  CardTitle,
} from "reactstrap";

//Needed to create Widgets
import Widget04 from '../../Widgets/Widget04';

//To Interact with the smart contract
import AuthenticationContract from '../../../../build/contracts/Authentication.json'
import store from '../../../store'
const contract = require('truffle-contract')

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: "",
      contracts: "",
      smartMeter: "",
    };    
  }

  componentDidMount() {
    this.getCustomerID();
  }

  getCustomerID() {
    let web3 = store.getState().web3.web3Instance;
    // Get Address of already deployed Authentication Contract
    // needed in combination with already deployed contracts
    let address = store.getState().user.data.smartContractAddress;

    // Double-check web3's status.
    if (typeof web3 !== 'undefined') {
      const authentication = contract(AuthenticationContract);
      authentication.setProvider(web3.currentProvider);
      //get current ethereum wallet
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }  
        authentication.at(address).then((instance) => {
          instance.getCurrentCustomerId({from: coinbase})
          .then((result) => {
            var value = result.valueOf();
            this.setState({
              customers: ""+value,
              contracts: ""+value,
              smartMeter: ""+ value
            });
          });
        });
      });
    } else {
      console.error("web3 undefined at contract creation")
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <Widget04 icon="icon-people" header={this.state.customers}>Kunden</Widget04>
          </Col>
          <Col>
            <Widget04 icon="icon-doc" header={this.state.contracts}>Verträge</Widget04>
          </Col>
          <Col>
            <Widget04 icon="icon-speedometer" header={this.state.smartMeter}>Wasserzähler</Widget04>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Dashboard;
