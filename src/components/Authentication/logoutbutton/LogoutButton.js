import React from 'react'
import { DropdownItem } from 'reactstrap'

                
const LogoutButton = ({ onLogoutUserClick }) => {
  return(
    <DropdownItem onClick={(event) => onLogoutUserClick(event)}><i className="fa fa-lock" ></i> Logout</DropdownItem>
  )
}

export default LogoutButton
