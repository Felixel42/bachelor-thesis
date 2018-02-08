import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import userReducer from './components/Authentication/userReducer'
import web3Reducer from './components/Utils/web3/web3Reducer'

//Kombiniert mehrere Reducer, damit sie von einem Reducer aus aufrufbar sind.
// https://github.com/mjrussell/redux-auth-wrapper/blob/96414c997c27478d3be12b7ed133e99e65996338/examples/react-router-4/app.js 
const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  web3: web3Reducer,
})

export default reducer