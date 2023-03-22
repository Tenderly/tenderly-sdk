import { Network, Tenderly } from '@tenderly/sdk';
import { getSafeL2SingletonDeployment } from '@gnosis.pm/safe-deployments';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const walletAddress = '0xbf8e06773e3c0c71969b15886a34c81aaafaeee9';
const safeAddress = '0x9A1E97b651607d4dcb6549dc78AaCf88366D92D0';
const safeL2SingletonDeployment = getSafeL2SingletonDeployment();

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT,
  projectName: process.env.TENDERLY_PROJECT,
  network: Network.POLYGON,
});

const safeL2SingletonInterface = new ethers.Interface(safeL2SingletonDeployment.abi);

(async () => {
  try {
    const input = safeL2SingletonInterface.encodeFunctionData('execTransaction', [
      '0xbf8e06773e3c0c71969b15886a34c81aaafaeee9',
      '200000000000000',
      '0x',
      '0',
      '0',
      '0',
      '0',
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      // eslint-disable-next-line max-len
      '0x000000000000000000000000bf8e06773e3c0c71969b15886a34c81aaafaeee9000000000000000000000000000000000000000000000000000000000000000001',
    ]);

    const failedTransaction = await tenderly.simulator.simulateTransaction({
      transaction: {
        from: walletAddress,
        to: safeAddress,
        gas: 30382993,
        gasPrice: '0',
        value: '0',
        input,
      },
      override: {
        [safeAddress]: {
          '0x0000000000000000000000000000000000000000000000000000000000000004':
            '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
      },
    });
    console.log(failedTransaction.status ? 'Success' : 'Failure');

    const successfulTransaction = await tenderly.simulator.simulateTransaction({
      transaction: {
        from: walletAddress,
        to: safeAddress,
        gas: 30382993,
        gasPrice: '0',
        value: '0',
        input,
      },
      override: {
        [safeAddress]: {},
      },
    });

    console.log(successfulTransaction.status ? 'Success' : 'Failure');

    // console.log(JSON.stringify(transaction, null, 2));
  } catch (e) {
    console.log(e);
  }
})();
