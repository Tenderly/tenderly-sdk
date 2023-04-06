import { Tenderly, Network } from '../dist';

import * as dotenv from 'dotenv';
dotenv.config();

try {
  const tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY || '',
    accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
    projectName: process.env.TENDERLY_PROJECT_NAME || '',
    network: Network.MAINNET,
  });

  const unverifiedContractAddress = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'.toLowerCase();
  const daiContract = '0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase();
  const sepoliaWalletAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46'.toLowerCase();

  (async () => {
    const unverifiedContract = await tenderly.contracts.add(unverifiedContractAddress, {
      displayName: 'Unverified Contract',
      tags: ['unverified-tag'],
    });
    const verifiedContract = await tenderly.contracts.add(daiContract);

    const wallet = await tenderly
      .with({ network: Network.SEPOLIA })
      .wallets.add(sepoliaWalletAddress, {
        displayName: 'Sepolia Wallet',
        tags: ['sepolia-tag'],
      });

    console.log(unverifiedContract);
    console.log(verifiedContract);
    console.log(wallet);
  })();
} catch (error) {
  console.error(error);

  if (error.name === 'InvalidArgumentsError') {
    console.error(error.message);
    console.log(
      'Please provide a valid access key, account name and project name, by populating .env file.',
    );
  }
}
