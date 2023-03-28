import dotenv from 'dotenv';
import { Tenderly, Network } from '@tenderly/sdk';

dotenv.config();

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT_NAME,
  projectName: process.env.TENDERLY_PROJECT_NAME,
  network: Network.MAINNET,
});

const unverifiedContractAddress = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
const verifiedContractAddress = '0x00000000219ab540356cbb839cbe05303d7705fa';

(async () => {
  console.log('Adding unverified contract...');
  const unverifiedContract = await tenderly.contracts.add(unverifiedContractAddress);
  console.log('Adding verified contract...');
  const verifiedContract = await tenderly.contracts.add(verifiedContractAddress);
  console.log('Contracts added!');

  console.log('Unverified contract result: ', unverifiedContract);
  console.log('Verified contract result: ', verifiedContract);
})();
