import { Tenderly, Network } from '../../lib';

import * as dotenv from 'dotenv';
dotenv.config();

try {
  const tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY || '',
    accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
    projectName: process.env.TENDERLY_PROJECT_NAME || '',
    network: Network.MAINNET,
  });

  const sepoliaWalletAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46'.toLowerCase();

  (async () => {
    const wallet = await tenderly
      .with({ network: Network.SEPOLIA })
      .wallets.add(sepoliaWalletAddress, {
        displayName: 'Sepolia Wallet',
      });

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
