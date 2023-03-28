# Add A Verified And Unverified Contract

In this example you will see how to instantiate a new `Tenderly` instance and add both a verified, and unverified `Contract` to your project.

To do this you will need to call the `add` function in the `contracts` namespace on the `Tenderly` instance.
```javascript
const contract = await tenderlyInstance.contracts.add('0x1234567890123456789012345678901234567890');
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
