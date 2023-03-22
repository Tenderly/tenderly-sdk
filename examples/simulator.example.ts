import * as dotenv from 'dotenv';
import { Network, Tenderly } from '../lib';
import { ethers } from 'ethers';

dotenv.config();

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT_NAME,
  projectName: process.env.TENDERLY_PROJECT_NAME,
  network: Network.RINKEBY,
});

(async () => {
  const counterContractAddress = '0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057';

  const abi = [
    {
      inputs: [],
      name: 'count',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'dec',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'get',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'inc',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const abiInterface = new ethers.utils.Interface(abi);

  const transaction = await tenderly.simulator.simulateTransaction({
    transaction: {
      from: '0x0000000000000000000000000000000000000000000000000000000000000000',
      to: counterContractAddress,
      input: abiInterface.encodeFunctionData('inc'),
    },
    blockNumber: 12354651,
    override: {
      counterContract: {
        storage: {
          '0x0000000000000000000000000000000000000000000000000000000000000000':
            '0x0000000000000000000000000000000000000000000000000000000000000009',
        },
      },
    },
  });
  console.log('Transaction executed: ', transaction.timestamp);
})();
