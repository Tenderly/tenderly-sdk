import * as dotenv from 'dotenv';
import { Network, Tenderly } from '../lib';

dotenv.config();

const tenderly = new Tenderly(
  {
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  }
);

(async () => {

  const contract = await tenderly.contracts.get('0x06012c8cf97bead5deae237070f9587f8e7a266d');
  console.log('Contract: contract', (contract));

  const tetherAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

  console.log('Addid Tether: ', await tenderly.contracts.add(tetherAddress));
  const contract2 = await tenderly.contracts.get(tetherAddress);
  console.log('Tether added successfuly: ', (contract2));

})();

