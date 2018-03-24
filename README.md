# Bachelor thesis

The objective of my thesis can be briefly described  as: Design and implement a 2.0 version of Project Oaken's [water-meter-acorn](https://github.com/Oaken-Innovations/water-meter-acorn). Additional features are:

* Authentication via the Ethereum Blockchain
* Separate views for admin and customer
* Hourly recording of smart meter readings and payment history

## Goals

Cut out **intermediaries** involved in the billing and payment process of water suppliers. Utilizing the reliable, distributed and tamper-proof characteristics of Blockchain infrastructure to improve services around one of the most valuable resources. See also [Project Oaken's Video](https://youtu.be/DsR5Y7SiPlM?t=200)

It was a great opportunity for me to gain experiences about Ethereum, Smart Contracts and the related technologies.

## Table of contents

* [Bachelor thesis](#bachelor-thesis)
    * [Goals](#goals)
    * [Table of contents](#table-of-contents)
    * [Architectural overview](#architectural-overview)
    * [Process view](#process-view)
    * [Directories](#directories)
    * [Getting Started](#getting-started)
        * [Prerequisites](#prerequisites)
        * [Installing](#installing)
    * [Running the smart contract tests](#running-the-smart-contract-tests)
    * [Deployment of smart contracts](#deployment-of-smart-contracts)
        * [Local test-blockchain (truffle)](#local-test-blockchain-truffle)
        * [Testnet (Kovan, Rinkeby, Ropsten)](#testnet-kovan-rinkeby-ropsten)
    * [Usage](#usage)
        * [Authentication](#authentication)
        * [Create new contract and user](#create-new-contract-and-user)
        * [User login](#user-login)
        * [Request new invoice](#request-new-invoice)
        * [Pay Invoice](#pay-invoice)
        * [Receive money](#receive-money)
    * [Contributing](#contributing)
    * [License](#license)
    * [Acknowledgments](#acknowledgments)

## Architectural overview

![Overview](/docs/img/architecture.png)

## Process view

![BPMN](/docs/img/billing.png)

## Directories

```
Dapp/
├── contracts/   (Smart contracts)
├── migrations   (truffle deployment)
├── public/      (html template)
    ├── img/     (images)
├── scss/        (scss source)
├── src/         (js|jsx source)
├── test/        (truffle tests)
```

## Getting Started

The following instructions show how to run the **Dapp** (Decentralized Application) in combination with smart sontracts. The guide and resources to let the Raspberry Pi communicate with smart contracts can be found in this separate [Readme](/pi/README.md).

### Prerequisites

* node >= 6.0.0
* npm >= 5.0.0
* truffle >= 4.0.0

### Installing

```bash
npm install
// before calling npm start the first time
truffle compile
```

## Running the smart contract tests

```bash
truffle develop
test
```

## Deployment of smart contracts

### Local test-blockchain (truffle)

``` bash
truffle develop
migrate
```

### Testnet (Kovan, Rinkeby, Ropsten)

Only the [Authentication](contracts/Authentication.sol) smart contract must be deployed upfront to a network of your choice. Example on [Etherscan](https://kovan.etherscan.io/address/0x97a1389ffd594ccad95eadd253ce565b8735c190). The received contract address has to be changed in the [LoginButtonAction](src/components/Authentication/loginbutton/LoginButtonActions.js) from deployed to .at(yourAddressHere)

```javascript
authentication.deployed().then(function(instance) {
```

## Usage

```bash
truffle compile
npm start
```

### Authentication

Log in the first time as admin (public address of user specified in the constructor of Authentication smart contract). See how it works: [sequence_diagram](docs/img/sequence_diagram_authentication.png)

### Create new contract and user

### User login

### Request new invoice

### Pay Invoice

### Receive money

## Contributing

If you have any additions or problems regarding this guide, just open an issue, create a pull request or send me a pm.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details

## Acknowledgments

* [CoreUI React](https://coreui.io/react/) for providing an awesome react based and free admin template
* [Adafruit](https://learn.adafruit.com/adafruit-keg-bot?view=all) with their beer keg-bot tutorial as perfect smart meter example
* [Truffle](http://truffleframework.com) maintaining the in my opinion best IDE for smart contracts and provider for cool boxes
* [Redux-auth-wrapper](https://github.com/mjrussell/redux-auth-wrapper) as authentication component
* The whole Ethereum ecosystem, keep up the good work!
