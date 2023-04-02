# Add A Verified And Unverified Contract

In this example you will see how to instantiate a new `Tenderly` instance and add both a verified, and unverified `Contract` to your project.

To do this you will need to call the `verify` function in the `contracts` namespace on the `Tenderly` instance.

The `verify` function takes two arguments, the first is the address of the contract you want to verify, the second is an object with the following properties:
```javascript
const contract = await tenderlyInstance.contracts.verify('0x1234567890123456789012345678901234567890', {
    mode: 'private or public',
    contractToVerify: 'ContractName',
    solc: {
      compiler: {
        version: SolidityCompilerVersions.v0_8_19,
        evmVersion: "default",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
        // ...
      },
      sources: {
        'ContractName.sol': {
          name: 'ContractName',
          code: '//source code',
        },
      },
    },
  });
```

Note that the solc json example used `metadata.useLiteralContent: true` to include the source code in the metadata.


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

Create a `.env` file in this directory and add the following variables

```bash
# Also found in .env.example
SEPOLIA_PRIVATE_KEY="YOUR_PRIVATE_KEY"
GATEWAY_KEY="YOUR_GATEWAY_KEY"
TENDERLY_ACCESS_KEY="YOUR_TENDERLY_ACCESS_KEY"
TENDERLY_ACCOUNT_NAME="YOUR_TENDERLY_ACCOUNT_NAME"
TENDERLY_PROJECT_NAME="YOUR_TENDERLY_PROJECT_NAME"
```

Run the example

```bash
# without deployment
yarn start:with-solc-json

# with deployment
yarn start:with-deployment
```
