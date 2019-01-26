/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Divider from '@material-ui/core/Divider';
import TradeItem from "./TradeItem";
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

export default class OrderBook extends React.Component {
  render() {
    return (
        <Paper className="p-3 color-dark">
        <Typography variant="h6" className="mb-2 text-light">Order book</Typography>

        <div className="p-2 d-flex justify-content-between text-light">
          <div style={{ width: 58 }} className="text-left">
            <p className="mb-0">Price</p>
          </div>
          <div style={{ width: 100 }} className="text-right">
            <p className="mb-0">Quantity (BK)</p>
          </div>
          <div style={{ width: 100 }} className="text-right">
            <p className="mb-0">Total (TRX)</p>
          </div>
        </div>

        <Divider />
        <div style={{ height: 708 }} className="d-flex">
          <div className="my-auto w-100">
            {
              this.props.buyOrders.map((trade, index) => (
                <TradeItem key={index} handleClick={() => this.props.handleOrderBookClick("buy", (trade.result.price / 10 ** 5).toFixed(5).toString(), (trade.result.quantity - trade.result.filled).toFixed(2).toString())} hoverable price={(trade.result.price / 10 ** 5).toFixed(5).toString()} amount={(trade.result.quantity - trade.result.filled).toFixed(2).toString()} total={(trade.result.quantity * trade.result.price / 10 ** 5).toFixed(2) + " TRX"} type="buy" />
              ))
            }

            <div className={"d-flex justify-content-center text-center my-2"}>
              <Typography variant="h5" className={this.props.lastCompletedTrade.result.tradeType == "buy" ? "text-success" : "text-danger"} style={{ marginRight: 5, verticalAlign: "middle" }}>{(this.props.lastCompletedTrade.result.price / 10 ** 5).toFixed(5)}</Typography>
              {this.props.lastCompletedTrade.result.tradeType == "buy" ?
                <ArrowUpward style={{ fontSize: 32, verticalAlign: "middle" }} className="text-success" /> :
                <ArrowDownward style={{ fontSize: 32, verticalAlign: "middle" }} className="text-danger" />
              }
            </div>

            {
              this.props.sellOrders.map((trade, index) => (
                <TradeItem key={index} handleClick={() => this.props.handleOrderBookClick("sell", (trade.result.price / 10 ** 5).toFixed(5).toString(), (trade.result.quantity - trade.result.filled).toFixed(2).toString())} hoverable price={(trade.result.price / 10 ** 5).toFixed(5).toString()} amount={(trade.result.quantity - trade.result.filled).toFixed(2).toString()} total={(trade.result.quantity * trade.result.price / 10 ** 5).toFixed(2) + " TRX"} type="sell" />
              ))
            }
          </div>
        </div>
      </Paper>
    );
  }
}
