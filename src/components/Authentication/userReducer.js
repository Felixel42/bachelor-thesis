/*
 Der Reducer muss "pure" bleiben. Dinge die man niemans in einem Reducer tun sollte: 
 - Argumente verändern
 - API calls oder Routing Transitionen 
 - non pure functions, wie Date.now() oder Math.random aufrufen 
*/


const initialState = {
  data: null
}

/*
  state = initialState, action ist die Kurzschreibweise in der Methode für: 
  if (typeof state === 'undefined')
    return initialState;
*/
const userReducer = (state = initialState, action) => {
  if (action.type === 'USER_LOGGED_IN')
  {
    //Object assign ist Teil von ES6, wird aber noch nicht von allen Browsern untersützt --> polyfill oder Babelplugin nutzen.
    // --> siehe redux.js.org/docs/basics/Reducers.html 
    return Object.assign({}, state, {
      data: action.payload
    })
  }

  if (action.type === 'USER_LOGGED_OUT')
  {
    return Object.assign({}, state, {
      data: null
    })
  }

  return state
}

export default userReducer
