### **Verify Contract**

To verify a contract, you can use **`verify`** method of the **`contracts`** namespace:

```jsx

const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract CounterWithLogs {
  uint public count;

  event CounterChanged(
    string method,
    uint256 oldNumber,
    uint256 newNumber,
    address caller
  );

  // Function to get the current count
  function get() public view returns (uint) {
    return count;
  }

  // Function to increment count by 1
  function inc() public {
    emit CounterChanged("Increment", count, count + 1, msg.sender);
    count += 1;
  }

  // Function to decrement count by 1
  function dec() public {
    emit CounterChanged("Decrement", count, count - 1, msg.sender);

    count -= 1;
  }
}
`;


const myTokenAddress = '0x8aaf9071e6c3129653b2dc39044c3b79c0bfcfbf'.toLowerCase() as Web3Address;

  try {
    const contract = await tenderly.contracts.verify(myTokenAddress, {
      config: {
        mode: 'public',
      },
      contractToVerify: 'Counter.sol:CounterWithLogs',
      solc: {
        version: 'v0.8.18',
        sources: {
          'Counter.sol': {
            content: contractSource,
          },
        },
        settings: {
          libraries: {},
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    });

    console.log('Verified contract:', contract);
  } catch (error) {
    console.error("Error. Couldn't verify a contract: ", error);
  }
```