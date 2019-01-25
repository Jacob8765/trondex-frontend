/* eslint-disable react/jsx-no-target-blank */
import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import NavBar from "./components/NavBar";
import Trc20 from "./components/Trc20";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./index.css";
//import { match } from 'minimatch';

class App extends Component {
  constructor() {
    super();

    this.theme = createMuiTheme({
      palette: {
        primary: {
          main: "#2E2E2E",
          secondary: "#f44336"
        },
        type: 'dark',
        secondary: {
          main: "#357a38"
        },
        error: {
          main: "#f44336"
        }
      },
    });
  }

  render() {
    return (
      <Router>
        <MuiThemeProvider theme={this.theme}>
          <CssBaseline />

          <NavBar />

          <Route path="/trc20/:tokenID?" component={Trc20Exchange} />
        </MuiThemeProvider>
      </Router>
    );
  }
}

function Trc20Exchange({ match }) {
  return (
    <Trc20 tokenID={match.params.tokenID} />
  );
}

export default App;
