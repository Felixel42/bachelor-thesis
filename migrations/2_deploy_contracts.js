var Authentication = artifacts.require("./Authentication.sol");

// http://truffleframework.com/docs/getting_started/migrations#deployer-then-function invoke functions after deployment
// did not work like described in the link, needs further investigation just run truffle test to register people
module.exports = function(deployer) {
  deployer.deploy(Authentication, web3.eth.accounts[0]);
};
