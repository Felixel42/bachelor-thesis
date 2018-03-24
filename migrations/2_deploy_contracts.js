var Authentication = artifacts.require("./Authentication.sol");
var WaterMeterService = artifacts.require("./WaterMeterService.sol");

var dates = ['02017', '9', '10', '2017', '10', '17']

// http://truffleframework.com/docs/getting_started/migrations#deployer-then-function invoke functions after deployment
// did not work like described in the link, needs further investigation just run truffle test to register people
module.exports = function(deployer) {
  deployer.deploy(Authentication, web3.eth.accounts[0]);
  deployer.deploy(WaterMeterService, web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2], web3.toWei(0.004, 'ether'), dates);
};
