import { Tenderly, Network } from '../lib';

import * as dotenv from 'dotenv';
dotenv.config();

try {
  const tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY || '',
    accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
    projectName: process.env.TENDERLY_PROJECT_NAME || '',
    network: Network.MAINNET,
  });

  const kittyContractAddress = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();
  const unverifiedContractAddress = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'.toLowerCase();

  (async () => {
    const kittyContract = await tenderly.contracts.get(kittyContractAddress);
    const unverifiedContract = await tenderly.contracts.get(unverifiedContractAddress);

    console.log(unverifiedContract);
    console.log(kittyContract);
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
