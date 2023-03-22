import { Tenderly, Network } from '@tenderly/sdk';
import { ethers } from 'ethers';
import { approveContractAbi, universalRouterContractAbi } from './contractAbis';

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT,
  projectName: process.env.TENDERLY_PROJECT,
  network: Network.POLYGON,
});

const approveContractAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
const universalRouterContractAddress = '0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5';

const fromWalletAddress = '0x8d1d4e2b8b9b1b4b9e0d0d6d7c7c4e4e8d9d00e0';

const approveContractAbiInterface = new ethers.utils.Interface(approveContractAbi);
const universalRouterContractAbiInterface = new ethers.utils.Interface(universalRouterContractAbi);

(async () => {
  const transaction = await tenderly.simulator.simulateBundle([
    {
      transaction: {
        from: fromWalletAddress,
        to: approveContractAddress,
        gas: 0,
        gas_price: ethers.utils.hexValue(0),
        value: ethers.utils.hexValue(0),
        input: approveContractAbiInterface.encodeFunctionData('approve', [
          fromWalletAddress,
          1234567890,
        ]),
      },
      override: {
        [approveContractAddress]: {},
      },
    },
    {
      transaction: {
        from: fromWalletAddress,
        to: universalRouterContractAddress,
        gas: 0,
        gas_price: ethers.utils.hexValue(0),
        value: ethers.utils.hexValue(0),
        input: universalRouterContractAbiInterface.encodeFunctionData('execute', [
          '0x0b00',
          [
            /* eslint-disable max-len */
            '0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000001b1ae4d6e2ef500000',
            '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000001b1ae4d6e2ef5000000000000000000000000000000000000000000000000000000000000022251b7b00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000420d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f42791bca1f2de4661ed88a30c99a7a9449aa84174000064c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000000000000000000000',
            /* eslint-enable max-len */
          ],
        ]),
      },
      override: {
        [universalRouterContractAddress]: {},
      },
    },
  ]);

  console.log(JSON.stringify(transaction, null, 2));
})();
