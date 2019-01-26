/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withRouter } from 'react-router-dom'

const TokenList = withRouter((props) => (
  <List>
    {
      props.tokenData.map((token, index) => (
        <ListItem
          button
          onClick={() => { props.history.push(`/trc20/${token.contractAddress}`); props.updateToken(token.contractAddress) }}
          //onClick={() => props.updateToken(token.contractAddress)}
          selected={props.curentToken === token.contractAddress}
          key={index}
        >
          <ListItemText primary={token.abbriviation + "/TRX"} className="text-light" />
        </ListItem>
      ))
    }
  </List>
));

export default TokenList;