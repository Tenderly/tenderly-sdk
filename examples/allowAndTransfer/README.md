### **Allow and Transfer on ERC20**

In this example we simulate a common transaction sequence in which a user first approves another address (the spender), by calling **approve** method, to spend their tokens, which is followed by the spender calling **transferFrom** method on the contract to transfer the actual tokens. 

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

