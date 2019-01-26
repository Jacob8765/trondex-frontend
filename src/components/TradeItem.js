/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import "../index.css";

export default class TradeItem extends React.Component {
  render() {
    return (
      <div className={`p-2 d-flex justify-content-between ${this.props.hoverable ? 'trade-item' : ''}`} onClick={this.props.handleClick} style={this.props.handleClick ? {cursor: "pointer"} : {}}>
        <div className="text-right">
          <p className={`${this.props.type === "sell" ? "text-danger" : "text-success"} mb-0`}>{this.props.price}</p>
        </div>
        <div style={{ width: 100 }} className="text-right">
          <p className="mb-0 text-light">{this.props.amount}</p>
        </div>
        <div style={{ width: 100 }} className="text-right">
          <p className="mb-0 text-light">{this.props.time || this.props.total}</p>
        </div>
      </div>
    );
  }
}
