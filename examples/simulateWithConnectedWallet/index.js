import { Tenderly, Network } from '@tenderly/sdk';
// using ethers@5.7.2 because 6.2.0 rpc requests are not going through
import { ethers } from 'ethers';

// initialize a tenderly instance
const tenderlyInstance = new Tenderly({
  accessKey: 'YOUR_ACCESS_KEY',
  accountName: 'YOUR_ACCOUNT_NAME',
  projectName: 'YOUR_PROJECT_NAME',
  network: Network.MAINNET,
});

// define wallets to use
const fromWalletAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
const toWalletAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

(async () => {
  // create a provider that will use the tenderly gateway
  const provider = new ethers.providers.JsonRpcProvider(
    // Replace $YOUR_GATEWAY_KEY$ with your gateway key
    'https://mainnet.gateway.tenderly.co/$YOUR_GATEWAY_KEY$',
  );

  // add wallets to your tenderly project
  let fromWallet;
  let toWallet;
  try {
    [fromWallet, toWallet] = await Promise.all([
      tenderlyInstance.wallets.add(fromWalletAddress),
      tenderlyInstance.wallets.add(toWalletAddress),
    ]);
  } catch (e) {
    if (!fromWallet) {
      fromWallet = await tenderlyInstance.wallets.get(fromWalletAddress);
    }
    if (!toWallet) {
      toWallet = await tenderlyInstance.wallets.get(toWalletAddress);
    }
  }

  // define payload for simulation
  const payload = [
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
  ];

  // execute simulation
  const transaction = await provider.send('tenderly_simulateTransaction', payload);

  // log the result
  console.log(JSON.stringify(transaction, null, 2));
})();
