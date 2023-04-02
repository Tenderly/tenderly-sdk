# Add A Non Existing Contract To Your Project

In this example you will see how to instantiate a new `Tenderly` instance and add a non existing `Contract` to your project. This will in turn throw an error because `Tenderly` could not find the `Contract` on the specified `Network`.

To do this you will need to call the `add` function in the `contracts` namespace on the `Tenderly` instance.

```javascript
const contract = await tenderlyInstance.contracts.add('0xfake_contract_address');
```

# To Run This Example

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
