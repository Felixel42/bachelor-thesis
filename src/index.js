import React from 'react';
import ReactDOM from 'react-dom';
import {Router as Router, Route, Switch} from 'react-router-dom';
import {createHashHistory} from 'history';

//React-redux-auth stuff
import reducer from './reducer';
import { Provider } from 'react-redux';
import { ConnectedRouter} from 'react-router-redux'
import { userIsAuthenticated, userIsNotAuthenticated} from './components/Utils/wrapper';

// prevents using the app without web
import {Web3Provider} from 'react-web3';

// Import for web3 initialization
import getWeb3 from './components/Utils/web3/getWeb3'

import store from './store'

// Styles
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
  // Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import Main styles for this application
import '../scss/style.scss'

// Containers
import Full from './containers/Full/Full'

// Views
import Login from './views/Pages/Login/'

const history = createHashHistory();

// Initialize web3 and set in Redux.
getWeb3
.then(results => {
  console.log('Web3 initialized!')
})
.catch(() => {
  console.log('Error in web3 initialization.')
})

// Update Guide für React-Router 4
//https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/migrating.md

ReactDOM.render((
  <Web3Provider>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route exact path="/login" component={userIsNotAuthenticated(Login)}/>
          <Route path="/" name="Home" component={userIsAuthenticated(Full)}/>
        </Switch>
      </ConnectedRouter>
    </Provider>
  </Web3Provider>
), document.getElementById('root'));
