import dotenv from 'dotenv';
import { Tenderly, Network, ApiError } from '@tenderly/sdk';

dotenv.config();

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT_NAME,
  projectName: process.env.TENDERLY_PROJECT_NAME,
  network: Network.MAINNET,
});

const fakeContractAddress = '0xfake_contract_address';

(async () => {
  try {
    console.log('Trying to add non existing contract...');
    const contractResult = await tenderly.contracts.add(fakeContractAddress);

    // Will error before this line
    console.log(contractResult);
  } catch (e) {
    console.log(e instanceof ApiError);
    console.log('Error: ', e);
  }
})();
