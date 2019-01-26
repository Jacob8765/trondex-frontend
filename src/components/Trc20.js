/* eslint-disable react/jsx-no-target-blank */
import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ExchangeChart from "./ExchangeChart";
import { Link } from "react-router-dom";
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import TradeItem from "./TradeItem";
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import axios from "axios";

class Trc20 extends Component {
  constructor() {
    super();

    this.state = {
      //token: "TMWkPhsb1dnkAVNy8ej53KrFNGWy9BJrfu", //"TMWkPhsb1dnkAVNy8ej53KrFNGWy9BJrfu",
      contractAddress: "TB2fs3UCUEUkKyn9zm4n9JRHBAiGvafW4T", //"TAzjLUCyTYTdRp2kLWsfUAD4dqCPrN7ksA"
      tokenWebsite: "",
      tokenName: "",
      tokenSupply: 0,
      tokenAbbriviation: "",
      tokenPercent: 0,
      buyTokenAmount: "",
      buyTokenPrice: "0.0012",
      sellTokenAmount: "",
      sellTokenPrice: "0.0012",
      orderTab: 0,
      testTokenAddress: "TTjtjLikeG8uceJF7dUT4ecv3jjQyKy3ga",
      tokenBalance: 0,
      trxBalance: 0
    }

    this.tradeData = [{ result: { tradeType: "buy", price: 0.0000 * 10 ** 5, filled: 0 } }]
    this.chartData = [{ id: "ReynaToken", color: "hsl(300, 70%, 50%)", data: [{ x: 0, y: 2, color: "hsl(300, 70%, 50%)" }] }];
    this.tokenData = [];
    this.buyOrders = [];
    this.sellOrders = [];
    this.tradesFromAddress = [];
    this.completedTradesFromAddress = [];
    this.contractInstance = null;
    this.tokenInstance = null;

    for (let i = 0; i < 250; i++) {
      this.chartData[0].data.push({ x: i + 1, y: (Math.random() * 3) });
    }

    this.fetchTokenData();
  }

  fetchTokenData = async () => {
    fetch('http://localhost:8000/api/trc20Data')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.tokenData = data;

        data.map((token) => {
          if (token.contractAddress === this.state.token) {
            this.setState({
              tokenPercent: Math.round(Number(token.percentChange) * 10000) / 10000,
              //tokenPrice: token.price,
              tokenName: token.name,
              tokenAbbriviation: token.abbriviation,
              tokenWebsite: token.website,
              tokenSupply: token.supply,
            });
          }
        })
      });
  }

  handleTabChange = (event, value) => {
    this.setState({ orderTab: value });
  }

  handleInputChange = (event) => {
    if (parseFloat(event.target.value) < 0 || parseFloat(event.target.value) >= 0 || event.target.value == "") {
      if (event.target.value.indexOf(".") !== -1) {
        if (event.target.value.split(".")[1].length > 5) {
          return false;
        }
      }

      this.setState({
        [event.target.name]: event.target.value,
      });
    }
  }

  updateToken = (tokenID) => {
    //this.setState({ currentToken: tokenID });
    this.fetchTokenData();
  }

  async componentDidMount() {
    setTimeout(async () => {
      this.updateToken(Number(this.props.tokenID) || this.state.token);
      var localThis = this; //used inside event listeners
      this.contractInstance = await window.tronWeb.contract().at(this.state.contractAddress);
      this.tokenInstance = await window.tronWeb.contract().at(this.state.testTokenAddress);

      this.contractInstance["buyOrderEvent"]().watch(function (err, res) {
        console.log(res);
        localThis.updateOrderBook();
      });

      this.contractInstance["sellOrderEvent"]().watch(function (err, res) {
        console.log(res);
        localThis.updateOrderBook();
      });

      this.contractInstance["CompleteTrade"]().watch(function (err, res) {
        console.log(res);
        localThis.tradeData.unshift(res);
      });

      let completedTrades = await window.tronWeb.getEventResult(this.state.contractAddress, 0, "CompleteTrade", null, 20, 1); //collect 20 last completed trades
      //console.log(completedTrades);

      if (completedTrades.length > 0) {
        this.tradeData = completedTrades;
        //console.log(this.tradeData);
      }

      this.setState({ buyTokenPrice: (this.tradeData[0].result.price / 10 ** 5).toString(), sellTokenPrice: (this.tradeData[0].result.price / 10 ** 5).toString() });
      this.updateOrderBook();
    }, 750);
  }

  updateOrderBook = async () => {
    this.buyOrders = await window.tronWeb.getEventResult(this.state.contractAddress, 0, "buyOrderEvent", null, 10, 1); //collects the last 10 buy orders
    this.sellOrders = await window.tronWeb.getEventResult(this.state.contractAddress, 0, "sellOrderEvent", null, 10, 1); //collects the last 10 sell orders

    const tempBuyOrders = []
    for (var i = 0; i < this.buyOrders.length; i++) {
      const order = this.buyOrders[i];

      try {
        let orderResult = await this.contractInstance.buyOrders(order.result.tokenAddress, order.result.price, order.result.id).call();
        order.result.filled = window.tronWeb.toDecimal(orderResult.filled._hex);
        //console.log(order.result, orderResult.tradeHash);
        if (order.result.tradeHash == orderResult.tradeHash) {
          tempBuyOrders.push(order);
        }
      } catch (err) {
        //console.log(err);
      }
    }

    this.buyOrders = tempBuyOrders.reverse();

    const tempSellOrders = []
    for (var i = 0; i < this.sellOrders.length; i++) {
      const order = this.sellOrders[i];

      try {
        let orderResult = await this.contractInstance.sellOrders(order.result.tokenAddress, order.result.price, order.result.id).call();
        order.result.filled = window.tronWeb.toDecimal(orderResult.filled._hex);
        if (order.result.tradeHash == orderResult.tradeHash) {
          tempSellOrders.push(order);
        }
      } catch (err) {
        //console.log(err);
      }
    }

    this.sellOrders = tempSellOrders;

    const tempTradesFromAddress = [];
    const tempCompletedTradesFromAddress = [];
    fetch(`http://localhost:8000/api/tradesFromAddress/${window.tronWeb.defaultAddress.base58}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.map(async (item) => {
          //console.log(item);
          try {
            let result = await this.contractInstance[item.tradeType + "Orders"](item.tokenAddress, parseInt((item.price * 10 ** 5).toFixed(0)), item.id).call();
            item.quantity = window.tronWeb.toDecimal(result.quantity._hex);
            item.filled = window.tronWeb.toDecimal(result.filled._hex);

            console.log("exists");
            if (result.tradeHash == item.tradeHash) tempTradesFromAddress.unshift(item);
          } catch (err) {
            console.log("trade from address is completed");
            tempCompletedTradesFromAddress.unshift(item);
          }

          this.forceUpdate();
        });
      }).catch(err => console.log(err));

    this.tradesFromAddress = tempTradesFromAddress;
    this.completedTradesFromAddress = tempCompletedTradesFromAddress;
    //console.log("Completed trades from address", this.completedTradesFromAddress);

    let tokenBalance = await this.tokenInstance.balanceOf(window.tronWeb.defaultAddress.base58).call();
    let trxBalance = await window.tronWeb.trx.getBalance(window.tronWeb.defaultAddress.base58);

    this.setState({ tokenBalance: window.tronWeb.toDecimal(tokenBalance._hex), trxBalance: parseInt(window.tronWeb.fromSun(trxBalance)) });
    //this.forceUpdate();
  }

  cancelOrder = async (type, id) => {
    let order = this.tradesFromAddress[id];
    console.log(order, type == "buy" ? "Buy" : "Sell");

    try {
      let response = await this.contractInstance[`cancel${type == "buy" ? "Buy" : "Sell"}Order`](order.id, order.tokenAddress, parseInt((order.price * 10 ** 5).toFixed(0))).send({ shouldPollResponse: true });
      console.log(response);
    } catch (err) {
      console.log(err);
      return false;
    }

    this.updateOrderBook();
  }

  buyOrder = async () => {
    if (window.tronWeb) {
      if (window.tronWeb.ready) {
        const orderCost = (parseFloat(this.state.buyTokenAmount) * parseFloat(this.state.buyTokenPrice)).toFixed(5);
        console.log("Order cost: " + orderCost);
        console.log("buy price: " + (parseFloat(this.state.buyTokenPrice) * (10 ** 5)).toFixed(0))

        if (orderCost >= 1) {
          let args = {
            callValue: window.tronWeb.toSun(orderCost),
            shouldPollResponse: true
          }

          const tradeHash = await window.tronWeb.defaultAddress.base58.substring(4, 7) + "_" + (Date.now() / Math.random()) + "_b";
          let result = await this.contractInstance.buyOrder(this.state.testTokenAddress, (parseFloat(this.state.buyTokenPrice) * 10 ** 5).toFixed(0), parseInt(this.state.buyTokenAmount), tradeHash).send(args);

          axios.post(`http://localhost:8000/api/addTradeFromAddress/${window.tronWeb.defaultAddress.base58}`, {
            price: parseFloat(this.state.buyTokenPrice),
            quantity: parseFloat(this.state.buyTokenAmount),
            id: window.tronWeb.toDecimal(result._hex),
            tokenAddress: this.state.testTokenAddress,
            tradeType: "buy",
            tradeHash: tradeHash
          })
            .then((response) => {
              console.log(response);
              this.updateOrderBook();
            })
            .catch(function (error) {
              console.log(error);
            });
        } else {
          console.log("Order total must be at least 1 TRX");
        }
      } else {
        console.log("Make sure you are logged into tronweb before you can trade");
      }
    } else {
      console.log("You have to install tronweb before you can trade");
    }
  }

  sellOrder = async () => {
    if (window.tronWeb) {
      if (window.tronWeb.ready) {
        const orderCost = (parseFloat(this.state.sellTokenAmount) * parseFloat(this.state.sellTokenPrice)).toFixed(5);
        console.log("Order cost: " + parseFloat(this.state.sellTokenAmount));
        console.log("sell price: " + (parseFloat(this.state.sellTokenPrice) * (10 ** 5)).toFixed(0))

        if (orderCost >= 1) {
          const tradeHash = await window.tronWeb.defaultAddress.base58.substring(4, 7) + "_" + (Date.now() / Math.random()) + "_s";

          try {
            let approveResult = await this.tokenInstance.approve(this.state.contractAddress, parseFloat(this.state.sellTokenAmount)).send();
            console.log(approveResult);
          } catch (err) {
            console.log("Approve error: " + err);
          }

          let args = {
            //callValue: window.tronWeb.toSun(orderCost),
            shouldPollResponse: true
          }

          try {
            console.log("Submitting sell order");
            let result = await this.contractInstance.sellOrder(this.state.testTokenAddress, (parseFloat(this.state.sellTokenPrice) * 10 ** 5).toFixed(0), parseFloat(this.state.sellTokenAmount), tradeHash).send(args);
            axios.post(`http://localhost:8000/api/addTradeFromAddress/${window.tronWeb.defaultAddress.base58}`, {
              price: parseFloat(this.state.sellTokenPrice),
              quantity: parseFloat(this.state.sellTokenAmount),
              id: window.tronWeb.toDecimal(result._hex),
              tokenAddress: this.state.testTokenAddress,
              tradeType: "sell",
              tradeHash: tradeHash
            })
              .then((response) => {
                console.log(response);
                this.updateOrderBook();
              })
              .catch(function (error) {
                console.log(error);
              });
            //console.log(result);
          } catch (err) {
            console.log("Something went wrong", err);
          }
        } else {
          console.log("Order total must be at least 1 TRX");
        }
      } else {
        console.log("Make sure you are logged into tronweb before you can trade");
      }
    } else {
      console.log("You have to install tronweb before you can trade");
    }
  }

  handleOrderBookClick = (tradeType, price, quantity) => {
    let convertedTradeType = tradeType == "buy" ? "sell" : "buy";
    this.setState({[convertedTradeType + "TokenPrice"]: price, [convertedTradeType + "TokenAmount"]: convertedTradeType == "buy" ? parseFloat(quantity) * parseFloat(price) > this.state.trxAmount ? this.state.trxAmount : quantity : parseFloat(quantity) > this.state.tokenAmount ? this.state.tokenAmount : quantity});
  }

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={24} className="p-5" >
          <Grid item lg={3} xs={12}>
            <Grid container direction="column">
              <Grid item xs={12} className="mb-4">
                <Paper className="p-3 color-dark text-light" style={{ height: 503 }}>
                  <Typography variant="h6" className="mb-2">Tokens</Typography>
                  <List>
                    {
                      this.tokenData.map((token, index) => (
                        <ListItem
                          component={Link}
                          to={"/trc20/" + token.contractAddress}
                          button
                          onClick={() => this.updateToken(token.contractAddress)}
                          className="no-link-style"
                          selected={this.state.token === token.contractAddress}
                          key={index}
                        >
                          <ListItemText primary={token.abbriviation + "/TRX"} className="text-light" />
                        </ListItem>
                      ))
                    }
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper className="p-3 color-dark text-light" style={{ height: 293 }}>
                  <Typography variant="h6" className="mb-2">Trades</Typography>

                  <div className="p-2 d-flex justify-content-between">
                    <div style={{ width: 58 }} className="text-left">
                      <p className="mb-0">Price</p>
                    </div>
                    <div style={{ width: 100 }} className="text-right">
                      <p className="mb-0">Quantity (BK)</p>
                    </div>
                    <div style={{ width: 100 }} className="text-right">
                      <p className="mb-0">Time</p>
                    </div>
                  </div>

                  <Divider />
                  <div style={{ height: 180, overflowY: "scroll" }}>
                    {
                      this.tradeData.map((trade, index) => (
                        <TradeItem key={index} price={parseFloat(trade.result.price / 10 ** 5).toFixed(5).toString()} amount={parseFloat(trade.result.filled).toFixed(2).toString()} time={new Date(trade.timestamp).toLocaleTimeString()} type={trade.result.tradeType} />
                      ))
                    }
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid item lg={6} xs={12}>
            <Grid container direction="column">
              <Grid item lg={12} xs={12} className="mb-4">
                <Paper className="p-3 color-dark text-light">
                  <Typography variant="h6" className="mb-1">ReynaToken/TRX: 0.0014 <span className="text-success">+5.34%</span></Typography>
                  <Typography variant="body1" className="mb-3">24 hour chart</Typography>

                  <div style={{ height: 400 }}>
                    <ExchangeChart data={this.chartData} />
                  </div>
                </Paper>
              </Grid>

              <Grid container direction="row" spacing={24}>
                <Grid item lg={6} xs={12}>
                  <Paper className="p-3 color-dark text-light">
                    <Typography variant="h6" className="mb-2">Buy ReynaToken</Typography>

                    <TextField
                      name="buyTokenPrice"
                      value={this.state.buyTokenPrice}
                      onChange={this.handleInputChange}
                      label="Buy price"
                      fullWidth
                      margin="normal"
                    />

                    <TextField
                      name="buyTokenAmount"
                      label="Quantity"
                      fullWidth
                      onChange={this.handleInputChange}
                      value={this.state.buyTokenAmount}
                      margin="normal"
                    />
                    <div className="d-flex justify-content-between">
                      <Typography variant="body2" className="mb-3">Cost: ~{(parseFloat(this.state.buyTokenAmount || 0) * parseFloat(this.state.buyTokenPrice || 0)).toFixed(5)} TRX</Typography>
                      <Typography variant="body2" className="mb-3">Balance: {this.state.trxBalance} TRX</Typography>
                    </div>

                    <Button variant="contained" color="secondary" fullWidth className="no-outline" onClick={this.buyOrder}>Buy ReynaToken</Button>
                  </Paper>
                </Grid>

                <Grid item lg={6} xs={12}>
                  <Paper className="p-3 color-dark text-light">
                    <Typography variant="h6" className="mb-2">Sell ReynaToken</Typography>

                    <TextField
                      name="sellTokenPrice"
                      onChange={this.handleInputChange}
                      value={this.state.sellTokenPrice}
                      label="Sell price"
                      fullWidth
                      margin="normal"
                    />

                    <TextField
                      name="sellTokenAmount"
                      label="Quantity"
                      fullWidth
                      onChange={this.handleInputChange}
                      value={this.state.sellTokenAmount}
                      margin="normal"
                    />
                    <div className="d-flex justify-content-between">
                      <Typography variant="body2" className="mb-3">Gain: ~{(parseFloat(this.state.sellTokenAmount || 0) * parseFloat(this.state.sellTokenPrice || 0)).toFixed(5)} TRX</Typography>
                      <Typography variant="body2" className="mb-3">Balance: {this.state.tokenBalance} BK</Typography>
                    </div>

                    <Button variant="contained" fullWidth className="bg-danger text-light no-outline" onClick={this.sellOrder}>Sell ReynaToken</Button>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item lg={3} xs={12}>
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
                    this.buyOrders.map((trade, index) => (
                      <TradeItem key={index} handleClick={() => this.handleOrderBookClick("buy", (trade.result.price / 10 ** 5).toFixed(5).toString(), (trade.result.quantity - trade.result.filled).toFixed(2).toString())} hoverable price={(trade.result.price / 10 ** 5).toFixed(5).toString()} amount={(trade.result.quantity - trade.result.filled).toFixed(2).toString()} total={(trade.result.quantity * trade.result.price / 10 ** 5).toFixed(2) + " TRX"} type="buy" />
                    ))
                  }

                  <div className={"d-flex justify-content-center text-center my-2"}>
                    <Typography variant="h5" className={this.tradeData[0].result.tradeType == "buy" ? "text-success" : "text-danger"} style={{ marginRight: 5, verticalAlign: "middle" }}>{(this.tradeData[0].result.price / 10 ** 5).toFixed(5)}</Typography>
                    {this.tradeData[0].result.tradeType == "buy" ?
                      <ArrowUpward style={{ fontSize: 32, verticalAlign: "middle" }} className="text-success" /> :
                      <ArrowDownward style={{ fontSize: 32, verticalAlign: "middle" }} className="text-danger" />
                    }
                  </div>

                  {
                    this.sellOrders.map((trade, index) => (
                      <TradeItem key={index} handleClick={() => this.handleOrderBookClick("sell", (trade.result.price / 10 ** 5).toFixed(5).toString(), (trade.result.quantity - trade.result.filled).toFixed(2).toString())} hoverable price={(trade.result.price / 10 ** 5).toFixed(5).toString()} amount={(trade.result.quantity - trade.result.filled).toFixed(2).toString()} total={(trade.result.quantity * trade.result.price / 10 ** 5).toFixed(2) + " TRX"} type="sell" />
                    ))
                  }
                </div>
              </div>
            </Paper>
          </Grid>

          {/*  <Grid item lg={4} xs={12}>
            <Paper className="p-3 color-dark text-light">
              <Typography variant="h6" className="mb-2 text-light">Token details</Typography>

              <Typography variant="subtitle1" className="mb-1 text-light">Token name: {this.state.tokenName}</Typography>
              <Typography variant="subtitle1" className="mb-1 text-light">24 hour volume: 124,000 REY</Typography>
              <Typography variant="subtitle1" className="mb-1 text-light">Contract address: {this.state.token}</Typography>
              <Typography variant="subtitle1" className="mb-1 text-light">Token type: TRC20</Typography>
              <Typography variant="subtitle1" className="mb-1 text-light">Website: <a href="#">{this.state.tokenWebsite}</a></Typography>
            </Paper>
          </Grid> */}

          <Grid item lg={12} xs={12}>
            <Paper className="p-3 color-dark text-light">
              <AppBar position="static" className="color-dark mb-2">
                <Tabs value={this.state.orderTab} onChange={this.handleTabChange}>
                  <Tab label="My open orders" className="no-outline" />
                  <Tab label="My order history" className="no-outline" />
                </Tabs>
              </AppBar>
              {this.state.orderTab === 0 ?
                this.tradesFromAddress.length <= 0 ? "No open orders" :
                  <div>
                    <div className="p-2 d-flex justify-content-between text-light">
                      <div style={{ width: 58 }} className="text-left">
                        <p className="mb-0">Price</p>
                      </div>
                      <div style={{ width: 200 }} className="text-right">
                        <p className="mb-0">Quantity</p>
                      </div>
                      <div style={{ width: 200 }} className="text-right">
                        <p className="mb-0">Filled</p>
                      </div>
                      <div style={{ width: 200 }} className="text-right">
                        <p className="mb-0">Actions</p>
                      </div>
                    </div>

                    <Divider />
                    {
                      this.tradesFromAddress.map((trade, index) => (
                        trade.filled < trade.quantity ?
                          <div className="p-2 d-flex justify-content-between" key={index}>
                            <div className="text-right">
                              <p className={`${trade.tradeType === "sell" ? "text-danger" : "text-success"} mb-0`}>{trade.price.toFixed(5)}</p>
                            </div>
                            {/*  <div style={{ width: 200, verticalAlign: "middle" }} className="text-left">
                              <p className={`${trade.tradeType === "sell" ? "text-danger" : "text-success"} mb-0`}>{trade.tradeType.substring(0, 1).toUpperCase() + trade.tradeType.substring(1, trade.tradeType.length)}</p>
                            </div> */}
                            <div style={{ width: 200, verticalAlign: "middle" }} className="text-right">
                              <p className="mb-0 text-light">{trade.quantity}</p>
                            </div>
                            <div style={{ width: 200, verticalAlign: "middle" }} className="text-left">
                              <p className="mb-0 text-light">{trade.filled} ({trade.filled / trade.quantity * 100}%)</p>
                              <LinearProgress color="secondary" variant="determinate" value={trade.filled / trade.quantity * 100} />
                            </div>
                            <div style={{ width: 200 }} className="text-right">
                              <Button variant="outlined" className="mb-0 no-outline" onClick={() => this.cancelOrder(trade.tradeType, index)}>Cancel order</Button>
                            </div>
                          </div>
                          : null
                      ))
                    }
                  </div>
                : null}

              {this.state.orderTab === 1 ?
                this.completedTradesFromAddress.length <= 0 ? "No completed orders" :
                  <div>
                    <div className="p-2 d-flex justify-content-between text-light">
                      <div style={{ width: 58 }} className="text-left">
                        <p className="mb-0">Price</p>
                      </div>
                      <div style={{ width: 200 }} className="text-right">
                        <p className="mb-0">Quantity</p>
                      </div>
                      <div style={{ width: 200 }} className="text-right">
                        <p className="mb-0">Filled</p>
                      </div>
                    </div>

                    <Divider />
                    {
                      this.completedTradesFromAddress.map((trade, index) => (
                        <div className="p-2 d-flex justify-content-between" key={index}>
                          <div className="text-right">
                            <p className={`${trade.tradeType === "sell" ? "text-danger" : "text-success"} mb-0`}>{trade.price.toFixed(5)}</p>
                          </div>
                          <div style={{ width: 200, verticalAlign: "middle" }} className="text-right">
                            <p className="mb-0 text-light">{trade.quantity}</p>
                          </div>
                          <div style={{ width: 200, verticalAlign: "middle" }} className="text-right">
                            <p className="mb-0 text-light">{trade.filled}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                : null
              }
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default Trc20;