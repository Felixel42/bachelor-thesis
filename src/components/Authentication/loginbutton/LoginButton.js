import React from 'react'
import {Button} from "reactstrap";

const LoginButton = ({ onLoginUserClick }) => {
  return(
    <Button color="primary" size="lg" onClick={(event) => onLoginUserClick(event)}>Login</Button>
  )
}

export default LoginButton
