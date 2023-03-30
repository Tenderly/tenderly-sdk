/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv';
import { Tenderly, Network, ApiError, InvalidConstructorParametersError } from '../../../lib';

dotenv.config();

const fakeContractAddress = '0xfake_contract_address';

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: process.env.TENDERLY_ACCESS_KEY,
      accountName: process.env.TENDERLY_ACCOUNT_NAME,
      projectName: process.env.TENDERLY_PROJECT_NAME,
      network: Network.MAINNET,
    });

    console.log('Trying to add non existing contract...');
    const contractResult = await tenderly.contracts.add(fakeContractAddress);

    // Will error before this line
    console.log(contractResult);
  } catch (e) {
    if (e instanceof InvalidConstructorParametersError) {
      console.log('Please populate your .env file with the correct values');
      process.exit(1);
    }

    console.log('is ApiError: ', e instanceof ApiError);
    console.log(e);
  }
})();
