/* eslint-disable react/jsx-no-target-blank */
import React, { Component } from 'react';
import { XYPlot, YAxis, LineSeries } from "react-vis";
import "../index.css";
import { Col, CardBody, Card, Row, MDBListGroup, MDBListGroupItem, MDBIcon } from "mdbreact";
import 'react-toastify/dist/ReactToastify.css';

class Portfolio extends Component {
  constructor() {
    super();

    this.state = {
      tokenData: [],
      chartData: [],
      currentBalance: 0,
      currentPercentChange: 0,
      tronLinkEnabled: false
    }

    this.fetchTokenData();

    setInterval(() => {
      this.fetchTokenData()
    }, 120000);
  }

  fetchTokenData = async () => {
    if (!!window.tronWeb && window.tronWeb.ready) {
      //this.setState({ tronLinkEnabled: true });

      fetch('https://api.coingecko.com/api/v3/coins/tron/tickers')
        .then((response) => {
          return response.json();
        })
        .then(async (tronData) => {
          const tronPrice = tronData.tickers[0].converted_last.usd;
          //console.log(tronPrice);

          var chartData = [];

          const data = await window.tronWeb.trx.getAccount(window.tronWeb.defaultAddress.base64);

          var tokenNames = [];

          data.asset.map((asset) => {
            if (asset.value > 0) {
              tokenNames.push(asset.key);
            }
          });

          const tokens = this.props.tokenData.filter(token => tokenNames.indexOf(token.tokenIDUtf8) !== -1);
          //console.log(tokens);
          this.setState({ tokenData: tokens });

          for (var i = 0; i < tokens[0].priceData.length; i++) {
            chartData.push({ x: 0, y: 0 });
          }

          tokens.map(async (token) => {
            const tokenAmount = await this.calculateTokenAmount(token.tokenIDUtf8)

            token.priceData.map((priceData, index) => {
              chartData[index] = { x: index + 1, y: chartData[index].y + priceData.tokenBalance * tokenAmount };
            });

            this.setState({
              chartData: chartData,
              currentBalance: chartData[chartData.length - 1].y,
              currentPercentChange: chartData[chartData.length - 1].y / chartData[0].y * 100 - 100,
              tronPrice: tronPrice
            });
          });
        });
    }
  }

  calculateTokenAmount = async (name) => {
    if (!!window.tronWeb) {
      const data = await window.tronWeb.trx.getAccount(window.tronWeb.defaultAddress.base64);
      const amount = data.asset.filter(token => token.key == name)[0] ? data.asset.filter(token => token.key == name)[0].value : 1;
      //console.log(amount);

      return amount;
    } else {
      return 1;
    }
  }

  render() {
    if (!!window.tronWeb && window.tronWeb.ready) {
      return (
        <React.Fragment>
          <div className="text-center my-3 text-light mt-4">
            <h5>My Portfolio</h5>
            <h3>{parseInt(this.state.currentBalance)} TRX (${Math.round((this.state.currentBalance * this.state.tronPrice) * 100) / 100})</h3>
          </div>

          <Row className="d-flex justify-content-center m-0">
            <Col xl="12" className="m-4">
              <Card className="elegant-color text-light" ref="chartParentRef">
                <CardBody>
                  <h4 className="my-1">{Math.round(this.state.currentBalance * 100) / 100} TRX <span className={"text-" + (this.state.currentPercentChange <= 0 ? "danger" : "success")}>{(this.state.currentPercentChange > 0 ? "+" : "") + Math.round(this.state.currentPercentChange * 1000) / 1000 + "%"}</span></h4>
                  <h6>24 Hour Price Chart</h6>

                  <div className="mx-auto">
                    <XYPlot
                      margin={{ left: 100, right: 100, top: 25 }}
                      width={window.innerWidth - 50}
                      height={450}>
                      <LineSeries
                        data={this.state.chartData}
                        color="#00C851"
                        style={{ strokeWidth: 3 }}
                      />
                      <YAxis style={{ fontSize: "1rem" }} />
                    </XYPlot>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl="12" className="m-4">
              <Card className="elegant-color text-light">
                <CardBody>
                  <h4 className="my-3">Tokens</h4>
                  <MDBListGroup className="elegant-color text-light">
                    {
                      this.state.tokenData.map((token, index) => (
                        <MDBListGroupItem
                          key={index}
                          className="elegant-color hoverable cursor-default">
                          <span className="mr-3">{token.tokenIDUtf8}:</span> {Math.round(token.currentPrice * 10000) / 10000} TRX (${Math.round((token.currentPrice * this.state.tronPrice) * 100000) / 100000}) <span className={"text-" + (token.percentChange <= 0 ? "danger" : "success")}>{(token.percentChange > 0 ? "+" : "") + Math.round(Number(token.percentChange) * 100) / 100 + "%"}</span>
                        </MDBListGroupItem>
                      ))
                    }
                  </MDBListGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      );
    } else {
      return (
        <div className="m-5 text-light text-center">
          <div className="d-flex justify-content-center m-2">
            <MDBIcon icon="search" size="5x" />
          </div>
          <h3>Nothing to see here...</h3>
          <p>Either you don't have Tronlink configured, or you haven't purchased any tokens yet</p>
        </div>
      );
    }
  }
}

export default Portfolio;
