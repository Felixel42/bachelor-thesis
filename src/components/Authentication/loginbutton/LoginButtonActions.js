import AuthenticationContract from '../../../../build/contracts/Authentication.json'
import store from '../../../store'

const contract = require('truffle-contract')

//Action Type --> Könnte man auch in eigene Datei auslagern
export const USER_LOGGED_IN = 'USER_LOGGED_IN'


//Action Creator, --> Creates Action and returns ist. 
function userLoggedIn(user) {
  return {
    type: USER_LOGGED_IN,
    payload: user
  }
}

// How to Use Contract from truffle https://github.com/trufflesuite/truffle-contract 
export function loginUser() {
  let web3 = store.getState().web3.web3Instance
  //console.log(web3);
  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {
    
    return function(dispatch) {
      // Using truffle-contract we create the authentication object.
      const authentication = contract(AuthenticationContract)
      authentication.setProvider(web3.currentProvider)
      // Declaring this for later so we can chain functions on Authentication.
      // var authenticationInstance
      
      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        
        // Change to .at(address) instead of deployed to use an existing Authentication Contract First Try,('0x8D0B8D01fd2155C8bfb670D65432b3251A60e2Ee')   
        // Newer Version in combination with version2 of contract at("0xb2c4698827E078b17f2FE3ed8c15500079177234"), all on Kovan
        // at("0x97a1389fFd594CCAd95EaDd253cE565b8735c190")
        authentication.at("0x97a1389fFd594CCAd95EaDd253cE565b8735c190").then(function(instance) {
          var authenticationInstance = instance
          //Create Authentication Event
          instance.authenticate({from: coinbase})
          .then(function(result) {
            var txHash = result.tx;
            console.log(txHash);
            // watch for events from contract
            var watchEvent = instance.AuthenticationToken({from: coinbase});
            watchEvent.watch(function(error, result) {
              // if transaction hash of the event is the same as the returned hash from invoking the authenticate method
              if(result.transactionHash === txHash) {
                console.log("hashes are the same")
                // Attempt to login user.
                authenticationInstance.login({from: coinbase})
                .then(function(result) {
                  //console.log(userName);
                  // console.log(result[1]);
                  // console.log(result[2]);
                  
                  //Die Create Action Funktion wird an die dispatch Methode von Redux weitergegeben
                  dispatch(userLoggedIn({"name": result[0], "publicAddress": result[1], smartContractAddress: result[2]}))
                  
                  /* Alternative Schreibweise, für beispielsweise die Wiederverwendung der dispatch Methode
                  const boundUserLoggedIng = user => dispatch(userLoggedIn(user));
                  */
                  
                  //stop watching for events, to prevent double logins
                  watchEvent.stopWatching();
                  
                  console.log("push to Full")
                })
                .catch(function(result) {
                  // If error, go to something went wrong page
                  console.error('Wallet ' + coinbase + ' does not have an account!')
                
                })
              } else {
                console.error("Received TxHash from Method: " + txHash);
                console.error("Received TxHash from Event: "+ result.transactionHash);
              }
            });
          });
        })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}