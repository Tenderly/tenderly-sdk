import { Interface } from 'ethers';
import { Tenderly, Network } from '../../lib';

import * as dotenv from 'dotenv';
import { counterContractAbi } from './counterContract';
dotenv.config();

const callerAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46';
const counterContract = '0x93Cc0A80DE37EC4A4F97240B9807CDdfB4a19fB1';

const counterContractAbiInterface = new Interface(counterContractAbi);

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: process.env.TENDERLY_ACCESS_KEY || '',
      accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
      projectName: process.env.TENDERLY_PROJECT_NAME || '',
      network: Network.SEPOLIA,
    });

    const transaction = await tenderly.simulator.simulateTransaction({
      transaction: {
        from: callerAddress,
        to: counterContract,
        gas: 20000000,
        gas_price: '19419609232',
        value: 0,
        input: counterContractAbiInterface.encodeFunctionData('inc', []),
      },
      blockNumber: 3237677,
    });

    console.log('Simulated transaction:', transaction);
  } catch (error) {
    console.error('Error. Failed to simulate transaction: ', error);
  }
})();
