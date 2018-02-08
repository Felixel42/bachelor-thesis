pragma solidity ^0.4.13;
//newest supported solidity compiler version by truffle, see: https://github.com/trufflesuite/truffle/releases 

contract Authentication {
  address private owner;

  struct User {
    string name;
    address publicAddress;
    address smartContractAddress;
  }
  //store users with customer iD to be able to loop through all customers
  mapping (uint => User) private users;
  //Link address to customerID
  mapping (address => uint) private addressToId;
  // keeps track of unique customer ids, so owner can loop through customers and contracts
  uint private customerId = 0; 

  //check if account is authorized to call the function
  modifier onlyBy(address account) {
    require(msg.sender == account);
    _;
  }

  function Authentication(address _owner) {
    owner = _owner;
  }

  event AuthenticationToken(address from);

  function authenticate() external {
    AuthenticationToken(msg.sender);
  }

  function login() external constant returns (string, address, address) {
    // Check if user exists or if it is owner. 
    // If yes, return data from user struct. 
    // If no, throw.

    if (msg.sender == owner) {
      //if caller is owner, return name "admin", so that react knows that it has to redirect him to the admin page
      return ("admin", msg.sender, address(this));
    } else {
      //get cusomterId for address
      uint currCustomerId = addressToId[msg.sender];
      // customerId is greater than zero if an entry exists
      require(currCustomerId != 0);
      User memory userData = users[currCustomerId];

      return (userData.name, userData.publicAddress, userData.smartContractAddress);
    }
  }

  function registerCustomer(string name, address customerAddress, address waterServiceContract) external onlyBy(owner) {
    //Method is called from WaterProvider, when smart Contract for Water tracking is initiated, to register a new user
    //update customer id
    customerId += 1;

    addressToId[customerAddress] = customerId;
    users[customerId] = User(name, customerAddress, waterServiceContract);
  }

  function getCurrentCustomerId() external constant onlyBy(owner) returns (uint) {
    return customerId;
  }

  function getCredentialsForCustomer(uint _customerId) external constant onlyBy(owner) returns (string, address, address) {
    User memory userData = users[_customerId];
    return (userData.name, userData.publicAddress, userData.smartContractAddress);
  }
}
