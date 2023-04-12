### **Adding a contract**

To add a new contract, you can use the `add` method of the **`contracts`** namespace:

```jsx
try {
  const contractAddress '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const contract = await tenderly.contracts.add(contractAddress, {
    displayName: "MyContract"
  });
  
  console.log("Added contract:", addedContract);
  
} catch(error) {
  console.error("Error adding contract:", error);
}
```