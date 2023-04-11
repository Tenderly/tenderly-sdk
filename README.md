# Tenderly SDK

<p align='center'>
<a href="https://tenderly.co" >
<img src="https://tenderly.co/tenderly.svg" alt="tenderly-logo" width="100%" height="auto" style="background-color: #ffffffb2;padding: 10px 20px;box-sizing: border-box;max-width:200px;" />
</a>
<p align='center'>SDK for working with your favorite Web3 development platform</p><p align='center'><a><img alt='MIT License' src='https://img.shields.io/github/license/Tenderly/tenderly-sdk'/></a> <a><img alt='npm version' src='https://img.shields.io/npm/v/@tenderly/sdk' /></a> <a><img alt='github stars' src='https://img.shields.io/github/stars/Tenderly/tenderly-sdk?style=social' /></a> <a><img alt='Tenderly twitter' src='https://img.shields.io/twitter/follow/TenderlyApp?style=social' /></a></p>
</p>

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

<a href='https://github.com/colinhacks/zod#introduction'>Example</a>

List of supported networks can be found <a href='https://docs.tenderly.co/supported-networks-and-languages'>here</a>

## Documentation

Full documentation with example snippets here:<br /><a href='https://docs.tenderly.co'>Tenderly docs</a>

## Quick start

### Installation

Available on npm as <a href='https://www.npmjs.com/package/tenderly-sdk'>tenderly-sdk</a>
npm

```sh
npm i tenderly-sdk
```

yarn

```sh
yarn add tenderly-sdk
```

pnpm

```sh
pnpm add tenderly-sdk
```

### Basic usage

Instantiate a new tenderly instance

```ts
import { Tenderly, Network } from '@tenderly/sdk';

const tenderlyInstance = new TenderlyInstance({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT_NAME,
  projectName: process.env.TENDERLY_PROJECT_NAME,
  network: Network.MAINNET,
});
```

Fetch project contracts

```ts
const contracts = await tenderlyInstance.contracts.getBy();

console.log(contracts.map(contract => contract.address).join(', '));
// 0x63456...5689, 0x54j2...23890, 0x211e...289n
```

## Examples

<a>Link to contracts namespace example</a>

## Contributors

<a href="https://github.com/Tenderly/tenderly-sdk/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Tenderly/tenderly-sdk&max=900&columns=20" />
</a>
