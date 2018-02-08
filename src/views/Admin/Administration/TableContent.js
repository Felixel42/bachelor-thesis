import React, {Component} from "react";

// Get Compiled Json templates to create contracts
// And To Interact with the smart contract
import AuthenticationContract from '../../../../build/contracts/Authentication.json'
import WaterMeterServiceContract from '../../../../build/contracts/WaterMeterService.json'

// Blockchain stuff
import store from '../../../store'
const contract = require('truffle-contract')

class TableContent extends Component {
    constructor (props) {
        super(props);
        let web3 = store.getState().web3.web3Instance;
        
        // prepare Template to interact with Auth contract
        var _authenticationTemplate = contract(AuthenticationContract);
        _authenticationTemplate.setProvider(web3.currentProvider);
        
        // prepare Template to deploy a new WaterMeterService Contract
        var _waterMeterServiceTemplate = contract(WaterMeterServiceContract);
        _waterMeterServiceTemplate.setProvider(web3.currentProvider);

        this.state = {
            rows: [],
            web3Instance: web3,
            authenticationTemplate: _authenticationTemplate,
            waterMeterServiceTemplate: _waterMeterServiceTemplate,
        }
    }

    componentDidMount() {
        // Needed to add rows dynamically after button click this.props.setAddRow(this.addRowOnButtonClick);
        let web3 = this.state.web3Instance;
        var waterMeterServiceTemplate = this.state.waterMeterServiceTemplate;

        this.getCustomerID((instance, coinbase, result) => {
            // Variables in asynchronus loop calls always have to be let src: https://stackoverflow.com/questions/13343340/calling-an-asynchronous-function-within-a-for-loop-in-javascript
            for(let i = 1; i <=result.valueOf();i++ ) {
                let savedObj  = {id: i, name: '', address: '', price: '', startdate: '', enddate: ''};
                let savedWaterInstance;
                instance.getCredentialsForCustomer(i, {from: coinbase})
                .then((result) => {
                    savedObj.name = result[0];
                    savedObj.address = result[2];
                    waterMeterServiceTemplate.at(savedObj.address).then((waterInstance) => {
                        savedWaterInstance = waterInstance;
                        waterInstance.getPrice().then((result) => {
                            let ether = web3.fromWei(result,'ether');
                            savedObj.price = ether.valueOf();
                            savedWaterInstance.getStartDate().then((result) => {
                                savedObj.startdate = ""+result[2].valueOf()+"."+result[1].valueOf()+"."+result[0].valueOf();
                                savedWaterInstance.getEndDate().then((result) => {
                                    savedObj.enddate = ""+result[2].valueOf()+"."+result[1].valueOf()+"."+result[0].valueOf();
                                    let savedrows = this.state.rows.slice();
                                    savedrows.push(savedObj);
                                    this.setState({rows: savedrows});
                                })
                            })
                        })
                    });
                });
            }
        });
    }

    /* Method to add new row to table after anlegen button click TODO needs to be implemented that only new customer id will be added
    can be invoked already from parent class
    //https://stackoverflow.com/questions/36757889/add-row-on-button-press-react
    addRowOnButtonClick(name, address, price, dates) {
        this.getCustomerID((result) => {
            let savedObj = {id: result.valueOf(), name: name, address: address, price: price, startdate: result[2].valueOf()+"."+result[1].valueOf()+"."+result[0].valueOf(), enddate: result[5].valueOf()+"."+result[4].valueOf()+"."+result[3].valueOf()};
            let savedrows = this.state.rows.slice();
            savedrows.push(savedObj);
            this.setState({rows: savedrows});
        })
    }
    */
    getCustomerID(fn) {
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
                fn(instance, coinbase, result);
              });
            });
          });
        } else {
          console.error("web3 undefined at contract creation")
        }
    }

    render() {
        //srx for sorting: https://stackoverflow.com/questions/45309672/how-to-sort-html-table-in-reactjs 
        return (
            <tbody>
                {this.state.rows.sort((a,b) => a.id - b.id).map(result => 
                    <tr key={result.id}>
                        <td className="text-center">{result.id}</td>
                        <td className="text-center">{result.name}</td>
                        <td className="text-center">{result.address}</td>
                        <td className="text-center">{result.price}</td>
                        <td className="text-center">{result.startdate}</td>
                        <td className="text-center">{result.enddate}</td>
                    </tr>
                )}
            </tbody>
        )
    }
}

export default TableContent;