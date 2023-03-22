# Bundle Simulate An Approve And Swap Transaction

In this example you will see how to instantiate a new `Tenderly` instance and execute a `Simulate Bundle` for an `Approve` and `Swap` transaction.

## To Run this example

Install dependencies

```bash
# If you want to use current local changes

# install packages in the root directory
yarn

# build the package in the root directory
yarn build

# create yarn link in the root directory
yarn link

# link the package in this directory
yarn link @tenderly/hardhat-tenderly

# install packages in this directory
yarn

# otherwise just install all packages

yarn
```

Update the `Tenderly` constructor with your `accessKey`, `project` and `username` in `index.js`

```javascript
const tenderly = new Tenderly({
  accessKey: process.env.ACCESS_KEY,
  project: process.env.PROJECT,
  username: process.env.USERNAME,
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
