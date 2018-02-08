import { HashHistory } from 'history'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import reducer from './reducer'



// Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const routingMiddleware = routerMiddleware(HashHistory)

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(thunkMiddleware,routingMiddleware)
)

const store = createStore(reducer,enhancer)

export default store
