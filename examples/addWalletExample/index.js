import dotenv from 'dotenv';
import { Tenderly, Network } from '@tenderly/sdk';

dotenv.config();

const tenderlyInstance = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: process.env.TENDERLY_ACCOUNT,
  projectName: process.env.TENDERLY_PROJECT,
  network: Network.MAINNET,
});

const mainnetWallet = '0x0D0E328B8fBc4a148Eeae9E7b4791D7A6A0D2d07';

(async () => {
  let wallet;
  try {
    wallet = await tenderlyInstance.wallets.add(mainnetWallet);
  } catch (e) {
    // wallet already exists
    wallet = await tenderlyInstance.wallets.get(mainnetWallet);
  }

  console.log(wallet);
})();
