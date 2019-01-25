/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withRouter } from 'react-router-dom'

const NavBar = withRouter(({ history }) => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        TronDex
          </Typography>

      <div className="ml-auto">
        <Button color="inherit" onClick={() => history.push('/trc20')} className="no-outline">Trc20 Exchange</Button>
        <Button color="inherit" onClick={() => history.push('/trc10')} className="no-outline">Trc10 Exchange</Button>
        <Button color="inherit" className="no-outline">Profile</Button>
      </div>
    </Toolbar>
  </AppBar >
));

export default NavBar;