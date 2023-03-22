# Simulate A Transaction With A Connected Wallet

In this example you will see how to instantiate a new `Tenderly` instance and `Simulate` a transaction with a connected `Wallet`.

## To Run this example

Install dependencies

```bash
# If you want to use current local changes

yarn link # in the root of the repo

yarn link @tenderly/hardhat-tenderly # in this directory

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
const provider = new ethers.providers.JsonRpcProvider(
  // Replace $YOUR_GATEWAY_KEY$ with your gateway key
  'https://mainnet.gateway.tenderly.co/$YOUR_GATEWAY_KEY$',
);

const transaction = await provider.send('tenderly_simulateTransaction', [
  {
    from: fromWallet.address,
    to: toWallet.address,
    gas: ethers.utils.hexValue(0),
    gasPrice: ethers.utils.hexValue(0),
    value: ethers.utils.hexValue(0),
    data:
      '0xa9059cbb00000000000000000000000020a5814b73ef3537c6e099a0d45c798f4bd6e1d60000000' +
      '000000000000000000000000000000000000000000000000000000001',
  },
  'latest',
]);
```
