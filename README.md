# Tenderly SDK

<div align='center'>
<a href="https://tenderly.co" >
<img src="./assets/Tenderly Logo-Purple.png" alt="tenderly-logo" width="100%" height="auto" style="background-color: #ffffffb2;padding: 10px 20px;box-sizing: border-box;max-width:200px;" />
</a>
</div>
<div align='center'>

SDK for working with your favorite Web3 development platform

</div>

<div align='center'>


[![License](https://img.shields.io/github/license/Tenderly/tenderly-sdk)](./LICENSE.md)
[![npm](https://img.shields.io/npm/v/@tenderly%2Fsdk.svg)](https://www.npmjs.org/package/@tenderly/sdk)
[![Twitter](https://img.shields.io/twitter/follow/TenderlyApp?style=social)](https://twitter.com/intent/follow?screen_name=TenderlyApp)
[![Github](https://img.shields.io/github/stars/Tenderly/tenderly-sdk?style=social)](https://github.com/Tenderly/tenderly-sdk)

</div>

## Table of contents

<ul>
    <li><a href='#introduction'>Introduction</a></li>
    <li><a href='#documentation'>Documentation</a></li>
    <li><a href='#quick-start'>Quick start</a>
        <ul>
            <li><a href='#installation'>Installation</a></li>
            <li><a href='#basic-usage'>Basic usage</a></li>
        </ul>
    </li>
    <li><a href='#contributors'>Contributors</a></li>
</ul>

## Introduction

The Tenderly SDK provides an easy-to-use interface for interacting with the Tenderly platform.

It allows you to simulate transactions, simulate transaction bundles, manage contracts and wallets, and verify smart contracts from your code. The SDK is particularly useful for blockchain developers who want to integrate Tenderly's powerful tools into their dapp or development workflow.

List of supported networks can be found <a href='https://docs.tenderly.co/supported-networks-and-languages'>here</a>

## Documentation

Full documentation with example snippets here:<br /><a href='https://docs.tenderly.co/tenderly-sdk'>Tenderly SDK docs</a>

## Quick start

### Installation

Available on npm as <a href='https://www.npmjs.com/package/@tenderly/sdk'>tenderly-sdk</a>
npm

```sh
npm i @tenderly/sdk
```

yarn

```sh
yarn add @tenderly/sdk
```

pnpm

```sh
pnpm add @tenderly/sdk
```

### Quick start

Instantiate a new tenderly instance with your project details. _We highly recommend using environment variables for sensitive data such as access keys during your local development!_

```ts
import { Tenderly, Network } from '@tenderly/sdk';

const tenderlyInstance = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT_NAME,
  projectName: process.env.TENDERLY_PROJECT_NAME,
  network: Network.MAINNET,
});
```

Fetch project contracts

```ts
const contracts = await tenderlyInstance.contracts.getAll();

console.log(contracts.map(contract => contract.address).join(', '));
// 0x63456...5689, 0x54j2...23890, 0x211e...289n
```

## Examples

- <a href="./examples/addContracts">Add contracts</a>
- <a href="./examples/addWallets">Add wallets</a>
- <a href="./examples/allowAndTransfer">Allow and Transfer</a>
- <a href="./examples/contractVerification">Contract verification</a>
- <a href="./examples/simulateTransaction">Simulate transaction</a>
- <a href="./examples/simulateBundle">Simulate bundle</a>

## Contributors

<a href="https://github.com/Tenderly/tenderly-sdk/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Tenderly/tenderly-sdk&max=900&columns=20" />
</a>

## License

[MIT](LICENSE)
