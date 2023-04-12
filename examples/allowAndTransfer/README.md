### **Allow and Transfer on ERC20**

In this example we simulate a common transaction sequence in which a user first approves another address (the spender), by calling **approve** method, to spend their tokens, which is followed by the spender calling **transferFrom** method on the contract to transfer the actual tokens.


```typescript

    import { Interface } from 'ethers';
    import { myTokenAbi } from './myTokenAbi'; // ABI of the ERC20 token contract

    ...

    const myTokenAddress = '0x912043e00a14a6b79f5e500c825b1439e812d7ce';
    const fromWalletAddress = '0x8d1d4e2b8b9b1b4b9e0d0d6d7c7c4e4e8d9d00e0';
    const toWalletAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46';

    const myTokenAbiInterface = new Interface(myTokenAbi);

    const simulations = await tenderly.simulator.simulateBundle({
      transactions: [
        {
          from: fromWalletAddress,
          to: myTokenAddress,
          gas: 0,
          gas_price: '0',
          value: 0,
          input: myTokenAbiInterface.encodeFunctionData('approve', [toWalletAddress, 1234567890]),
        },
        {
          from: toWalletAddress,
          to: myTokenAddress,
          gas: 0,
          gas_price: '0',
          value: 0,
          input: myTokenAbiInterface.encodeFunctionData('transferFrom', [
            fromWalletAddress,
            toWalletAddress,
            1234567890,
          ]),
        },
      ],
      blockNumber: 3262454,
      overrides: {
        [myTokenAddress]: {
          state: {
            [`_balances[${fromWalletAddress}]`]: '1234567891',
          },
        },
      },
    });

```

Notice the overrides argument in for this transaction bundle:
```js
overrides: {
        [myTokenAddress]: {
          state: {
            [`_balances[${fromWalletAddress}]`]: '1234567891',
          },
        },
      },
```

This is used to override the state of the contract, in this case the balance of the sender. This is useful when you want to simulate a transaction bundle that is not possible in the current state of the contract.
