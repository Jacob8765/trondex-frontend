/* eslint-disable react/jsx-no-target-blank */
import React, { Component } from 'react';
import { MDBBtn, MDBIcon, Modal, ModalBody, ModalFooter, ModalHeader } from "mdbreact";

class Footer extends Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: false
    }
  }

  toggleModal = () => {
    this.setState({ modalIsOpen: !this.state.modalIsOpen });
  }

  render() {
    return (
      <React.Fragment>
        <div className="m-3 text-center">
          <a href="javascript:;" onClick={this.toggleModal} className="mx-3 link"><MDBIcon icon="question-circle" /> FAQ</a>
          <a href="https://twitter.com/TronDexExchange" target="_blank" className="mx-3 link"><MDBIcon icon="twitter" /> Twitter</a>
        </div>

        <Modal isOpen={this.state.modalIsOpen} toggle={this.toggleModal} size="lg">
          <ModalHeader toggle={this.toggleModal}>FAQ</ModalHeader>
          <ModalBody>
            <h4>What is TronLink and how can I install it?</h4>
            <p>TronLink is an interactive browser extension for signing, receiving and broadcasting TRON transactions. You can download TronLink <a href="https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec" target="_blank">here</a> for Chrome.</p>

            <h4 className="mt-2">Why did my trade fail?</h4>
            <p>Your trade can fail to be processed for a number of reasons, but some of the more common ones are</p>
            <ul>
              <li>You don't have enough balance to complete the trade</li>
              <li>TronLink isn't logged in or correctly configured</li>
              <li>You've tried to purchase a token quantity less than 1</li>
            </ul>

            <h4 className="mt-2">How can I list my token?</h4>
            <p>To list your token on trondex.exchange, contact us at <a href="mailto:listing@trondex.exchange">listing@trondex.exchange</a> with your token details. You will be asked to pay a 10,000 TRX fee for server and development costs.</p>

            <h4 className="mt-2">How can I get in contact with you?</h4>
            <p>The best way to get in contact is by tweeting us <a href="https://twitter.com/TronDexExchange" target="_blank">@TronDexExchange</a>. Alternatively, you can email us <a href="mailto:contact@trondex.exchange">here</a></p>

            <h4 className="mt-2">How often is the data on trondex.exchange updated?</h4>
            <p>The price data is updated every 5 seconds.</p>
          </ModalBody>
          <ModalFooter>
            <MDBBtn color="secondary" onClick={this.toggleModal}>Close</MDBBtn>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Footer;
