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
yarn
```

Update the `Tenderly` constructor with your `accessKey`, `projectName` and `accountName` in `index.js`

```javascript
const tenderly = new Tenderly({
  accessKey: process.env.ACCESS_KEY,
  projectName: process.env.PROJECT_NAME,
  accountName: process.env.ACCOUNT_NAME,
});
```

Run the example

```bash
yarn start
```
