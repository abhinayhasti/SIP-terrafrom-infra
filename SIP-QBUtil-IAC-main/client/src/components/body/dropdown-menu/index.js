import React from "react";
import {styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import Divider from '@mui/material/Divider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


const StyledMenu = styled((props) => (
  <Menu
    elevation={1}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(() => ({
  
}));


export default function DropDownMenu({handleTransactionData, handleAccountData, disabled}) {


  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="btn-menu"
        disableElevation
        disabled={disabled}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        export raw
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
          handleTransactionData();
          handleClose();
        }} disableRipple>
            Transaction Data
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => {
          handleAccountData();
          handleClose();
        }} disableRipple>
            Account Data
        </MenuItem>
      </StyledMenu>
    </div>
  );
}