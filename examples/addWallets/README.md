### **Adding a wallet**

To add a new wallet, you can use the **`add`** method of the **`wallets`** namespace:

```jsx
try {
  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const addedWallet = await tenderly.wallets.add(walletAddress, {
    displayName: "My Wallet",
  }); 

  console.log("Added wallet:", addedWallet);
  
} catch(error) {
  console.error("Error adding wallet:", error);
}

```