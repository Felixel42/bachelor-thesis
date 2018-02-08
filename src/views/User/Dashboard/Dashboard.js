import React, {Component} from "react";
import {Bar, Line} from "react-chartjs-2";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBlock,
  CardFooter,
  CardTitle,
  Button,
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  Alert
} from "reactstrap";

//Needed to create Widgets
import Widget04 from '../../Widgets/Widget04';

//To interact with contract
import WaterMeterServiceContract from '../../../../build/contracts/WaterMeterService.json'

// Blockchain stuff
import store from '../../../store'
const contract = require('truffle-contract')

const brandInfo = '#63c2de';

// Main Chart

// convert Hex to RGBA
function convertHex(hex, opacity) {
  hex = hex.replace('#', '');
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  
  var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  return result;
}

var mainChart = {
  labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'],
  datasets: [
    {
      label: 'Tagesverbrauch',
      backgroundColor: convertHex(brandInfo, 10),
      borderColor: brandInfo,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: [24]
    },
  ]
}

const mainChartOpts = {
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  scales: {
    xAxes: [{
      gridLines: {
        drawOnChartArea: false,
      }
    }],
    yAxes: [{
      ticks: {
        beginAtZero: true,
        maxTicksLimit: 5,
        stepSize: Math.ceil(20 / 4),
        max: 20
      }
    }]
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    }
  }
}


class Dashboard extends Component {
  constructor(props) {
    super(props);
    
    let web3 = store.getState().web3.web3Instance;
    
    // prepare Template to interact with a WaterMeterService Contract
    var _waterMeterServiceTemplate = contract(WaterMeterServiceContract);
    _waterMeterServiceTemplate.setProvider(web3.currentProvider);
    
    //address from the smart contract of a customer
    var smartContractAddress = store.getState().user.data.smartContractAddress;
    
    this.state = {
      web3: web3,
      waterMeterServiceTemplate: _waterMeterServiceTemplate,
      smartContractAddress: smartContractAddress,
      meterReading: "",
      newestConsumption: "",
      output: {
        meter: "",
        consumpt: "",
      },
      alerts: {
        meter: false,
        consumpt: false,
      },
      mainChart: mainChart
    };
    this.onDismissMeter = this.onDismissMeter.bind(this);
    this.onDismissConsumpt = this.onDismissConsumpt.bind(this);
  }
  
  componentDidMount() {
    var web3 = this.state.web3;
    this.getTotalMeterReading();
    this.getNewestConsumption();
    this.fillChartData();
  }

  decrementDateOneHour(date) {
    if (date.getHours() === 0) {
      date.setHours(-1)
    } else {
      date.setHours(date.getHours()-1)
    }
    return date;
  }

  getTotalMeterReading() {
    var date = new Date();
    date = this.decrementDateOneHour(date);
    this.getReadingForDate(date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), (result) => {
      this.setState({meterReading: result.valueOf()});
    });
  }

  getNewestConsumption() {
    var date = new Date()
    date = this.decrementDateOneHour(date);
    this.getConsumptionForDate(date, (result) => {
      this.setState({newestConsumption: ""+result.valueOf()});
    })
  }

  getConsumptionForDate(date, fn) {
    var savedNewestMetering;
    this.getReadingForDate(date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(),(result) => {
      savedNewestMetering = result;
      var dateMeterReadingBefore = this.decrementDateOneHour(date);
      this.getReadingForDate(dateMeterReadingBefore.getFullYear(), dateMeterReadingBefore.getMonth()+1, dateMeterReadingBefore.getDate(), dateMeterReadingBefore.getHours(), (result) => {
        var consumption = savedNewestMetering-result
        fn(consumption);
      })
    })
  }

  fillChartData() {
    var web3 = this.state.web3;
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
          var today = new Date();       
          for(let h = 0; h < today.getHours(); h++) {
            let d = new Date();
            d.setHours(h)
            this.getConsumptionForDate(d, (result) => {
              //console.log("index: " + h + "Wert: " + result.valueOf() + "Datum:" +d);
              var savedState = this.state.mainChart;
              savedState.datasets[0].data[h] = result;
              this.setState({mainChart: savedState});
            })
          }
      })
    });
  }
  
  wrapReadingForDate(date, hour, fn) {
    var year = date.substring(0,4)
    var month = date.substring(5,7) 
    var day = date.substr(8,10)
    this.getReadingForDate(year, month, day, hour, fn)
  }

  getReadingForDate(year, month, day, hour, fn) {
    var web3 = this.state.web3;
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
        savedInstance.getWaterMeterReading(year, month, day, hour, {from: coinbase})
        .then((result) => {
          fn(result)
        })
      });
    });
  }

  handleMeterClick(e) {
    e.preventDefault();
    //Validate if a field is Empty, src: https://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript 
    String.prototype.isEmpty = function() {
      return (this.length === 0 || !this.trim());
    };
    var date = this.hf_meterdate.value;
    var hour = this.hf_meterHour.value;

    if( date.isEmpty()) {
      var savedState = this.state.alerts;
      savedState.meter = true;
      this.setState({alerts: savedState});
      return;
    }

    this.wrapReadingForDate(date, hour, (result) => {
      var savedState = this.state.output;
      savedState.meter = result.valueOf()
      this.setState({output: savedState})
    })
  }

  handleConsumptClick(e) {
    e.preventDefault();
    //Validate if a field is Empty, src: https://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript 
    String.prototype.isEmpty = function() {
      return (this.length === 0 || !this.trim());
    };
    var date = this.hf_consumptdate.value;
    var hour = this.hf_consumptHour.value;

    //Needed to create a Date element
    var year = date.substring(0,4)
    var month = date.substring(5,7) 
    var day = date.substr(8,10)

    if( date.isEmpty()) {
      var savedState = this.state.alerts;
      savedState.consumpt = true;
      this.setState({alerts: savedState});
      return;
    }

    var searchedDate = new Date(year, parseInt(month)-1, day, hour);
    
    this.getConsumptionForDate(searchedDate, (result) => {
      var savedState = this.state.output;
      savedState.consumpt = result.valueOf()
      this.setState({output: savedState})
    })
  }

  onDismissMeter() {
    var savedState = this.state.alerts;
    savedState.meter = false;
    this.setState({alerts: savedState});
  }

  onDismissConsumpt() {
    var savedState = this.state.alerts;
    savedState.consumpt = false;
    this.setState({alerts: savedState});
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <Widget04 icon="icon-speedometer" header={this.state.meterReading}>Liter beträgt der aktuelle Zählerstand</Widget04>
          </Col>
          <Col>
            <Widget04 icon="icon-bell" header={this.state.newestConsumption}>Liter betrug der Verbrauch in der letzten Stunde</Widget04>
          </Col>
        </Row>
      <Row>
        <Col sm="6">
          <Card>
            <CardHeader>
              <strong>Zählerstandsabfrage</strong>
            </CardHeader>
            <CardBlock className="card-body">
              <Form action="" method="post" className="form-horizontal">
                <Row>
                  <Col>
                    <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="hf_meterdate">Datum</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="hf_meterdate" name="hf_meterdate" getRef={(input) => this.hf_meterdate = input}/>
                      <span className="help-block">Bitte das Datum des Zählerstands angeben</span>
                    </Col>
                    </FormGroup>
                    <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="hf_meterHour">Stunde</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="hf_meterHour" id="hf_meterHour" getRef={(input) => this.hf_meterHour = input}>
                        <option value="0">0</option>
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
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                        <option value="16">16</option>
                        <option value="17">17</option>
                        <option value="18">18</option>
                        <option value="19">19</option>
                        <option value="20">20</option>
                        <option value="21">21</option>
                        <option value="22">22</option>
                        <option value="23">23</option>                          
                      </Input>
                        <span className="help-block">Bitte eine Stunde auswählen</span>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="hf_meterOutput">Liter</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <output id="hf_meterOutput" name="hf_meterOutput">{this.state.output.meter}</output>
                    </Col>
                  </FormGroup>
                  </Col>
                </Row>
                <Alert color="danger" isOpen={this.state.alerts.meter} toggle={this.onDismissMeter}>
                    <strong>Datum fehlt</strong> Bitte Datum eintragen
                </Alert>
              </Form>
            </CardBlock>
            <CardFooter>
              <Button type="submit" size="sm" color="primary" onClick={(e) => this.handleMeterClick(e)}><i className="fa fa-dot-circle-o"></i>Abfragen</Button>
            </CardFooter>
          </Card>
        </Col>
        <Col sm="6">
        <Card>
            <CardHeader>
              <strong>Verbrauchsabfrage</strong>
            </CardHeader>
            <CardBlock className="card-body">
              <Form action="" method="post" className="form-horizontal">
                <Row>
                  <Col>
                    <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="hf_consumptdate">Datum</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="hf_consumptdate" name="hf_consumptdate" getRef={(input) => this.hf_consumptdate = input}/>
                      <span className="help-block">Bitte das Datum des Verbrauchs angeben</span>
                    </Col>
                    </FormGroup>
                    <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="hf_consumptHour">Stunde</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="hf_consumptHour" id="hf_consumptHour" getRef={(input) => this.hf_consumptHour = input}>
                        <option value="0">0</option>
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
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                        <option value="16">16</option>
                        <option value="17">17</option>
                        <option value="18">18</option>
                        <option value="19">19</option>
                        <option value="20">20</option>
                        <option value="21">21</option>
                        <option value="22">22</option>
                        <option value="23">23</option>                       
                      </Input>
                        <span className="help-block">Bitte eine Stunde auswählen</span>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="hf_consumptOutput">Liter</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <output id="hf_consumptOutput" name="hf_consumptOutput">{this.state.output.consumpt}</output>
                    </Col>
                  </FormGroup>
                  </Col>
                </Row>
                <Alert color="danger" isOpen={this.state.alerts.consumpt} toggle={this.onDismissConsumpt}>
                    <strong>Datum fehlt</strong> Bitte Datum eintragen
                </Alert>
              </Form>
            </CardBlock>
            <CardFooter>
              <Button type="submit" size="sm" color="primary" onClick={(e) => this.handleConsumptClick(e)}><i className="fa fa-dot-circle-o"></i>Abfragen</Button>
            </CardFooter>
          </Card>        
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <CardBlock className="card-body">
            <Row>
              <Col sm="5">
                <CardTitle className="mb-0">Tagesverbrauch</CardTitle>
                <div className="small text-muted">{Date()}</div>
              </Col>
            </Row>
            <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
            <Line data={this.state.mainChart} options={mainChartOpts} height={300}/>
            </div>
            </CardBlock>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Dashboard;
