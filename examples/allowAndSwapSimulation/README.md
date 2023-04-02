# Bundle Simulate An Approve And Swap Transaction

In this example you will see how to instantiate a new `Tenderly` instance and execute a `Simulate Bundle` for an `Approve` and `Swap` transaction.

The `simulateBundle` function accepts an array of transactions that you wish to simulate on `Tenderly`. See example below:
```javascript
const transactions = await tenderly.simulator.simulateBundle([
  {
    tranasaction: {
      from: '0xfrom_address',
      to: '0xto_address',
      gas: 0,
      gas_price: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
      input: contractAbi.encodeFunctionData(
        'functionName',
        arrayOfFunctionParams,
      ),
    },
    overrides: {
      '0xto_address': {
        value: {
          storageVariable: 'new_value',
        },
      },
    },
  },
  {
    transaction: {
      from: '0xfrom_address',
      to: '0xto_address',
      gas: 0,
      gas_price: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
      input: secondContractAbi.encodeFunctionData(
        'secondFunctionName',
        arrayOfSecondFunctionParams,
      ),
    },
  },
  // ...
]);
```

## To Run this example

Install dependencies

```bash
yarn
```

Update the `Tenderly` constructor with your `accessKey`, `projectName` and `accountName` in `index.js`

```javascript
const tenderly = new Tenderly({
  accessKey: process.env.ACCESS_KEY,
  projectName: process.env.PROJECT_NAME,
  accountName: process.env.accountName,
});
```

Run the example

```bash
yarn start
```

## TLDR

```javascript
const transaction = await tenderly.simulator.simulateBundle([
  {
    transaction: {
      from: fromWalletAddress,
      to: approveContractAddress,
      gas: 0,
      gas_price: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
      input: approveContractAbiInterface.encodeFunctionData('approve', [
        fromWalletAddress,
        1234567890,
      ]),
    },
    override: {
      [approveContractAddress]: {},
    },
  },
  {
    transaction: {
      from: fromWalletAddress,
      to: universalRouterContractAddress,
      gas: 0,
      gas_price: ethers.utils.hexValue(0),
      value: ethers.utils.hexValue(0),
      input: universalRouterContractAbiInterface.encodeFunctionData('execute', [
        '0x0b00',
        [
          '0x0000000...',
          '0x0000000...',
        ],
      ]),
    },
    override: {
      [universalRouterContractAddress]: {},
    },
  },
]);
```
