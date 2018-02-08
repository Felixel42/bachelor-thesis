import { browserHistory } from 'react-router'
import store from '../../../store'

export const USER_LOGGED_OUT = 'USER_LOGGED_OUT'
function userLoggedOut(user) {
  return {
    type: USER_LOGGED_OUT,
    payload: user
  }
}

export function logoutUser() {
  return function(dispatch) {
    console.log("dispatch");
    // Logout user.
    dispatch(userLoggedOut())
  }
}
