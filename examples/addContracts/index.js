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
  const unverifiedContract = await tenderly.contracts.add(unverifiedContractAddress);
  const verifiedContract = await tenderly.contracts.add(verifiedContractAddress);

  console.log(unverifiedContract);
  console.log(verifiedContract);
})();
