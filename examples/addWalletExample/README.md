# Add Wallet To Project Example

In this example you will see how to instantiate a new `Tenderly` instance and add a `Wallet` to your project.

To do this you will need to call the `add` function in the `wallets` namespace on the `Tenderly` instance.

This function accepts a second parameter for additional metadata for the wallet.
```javascript
const wallet = await tenderlyInstance.wallets.add('0x1234567890123456789012345678901234567890', {
  displayName: 'My Wallet',
  network: Network.MAINNET,
});
```

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
