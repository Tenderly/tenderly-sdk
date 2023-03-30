import dotenv from 'dotenv';
import { Tenderly, Network, InvalidConstructorParametersError } from '../../lib';

dotenv.config();

let tenderlyInstance: Tenderly;

const mainnetWallet = '0x0D0E328B8fBc4a148Eeae9E7b4791D7A6A0D2d07';

(async () => {
  try {
    tenderlyInstance = new Tenderly({
      accessKey: process.env.TENDERLY_ACCESS_KEY,
      accountName: process.env.TENDERLY_ACCOUNT_NAME,
      projectName: process.env.TENDERLY_PROJECT_NAME,
      network: Network.MAINNET,
    });

    let wallet;
    try {
      console.log('Adding wallet...');
      wallet = await tenderlyInstance.wallets.add(mainnetWallet);
    } catch (e) {
      console.log('Wallet already exists, getting wallet...');
      wallet = await tenderlyInstance.wallets.get(mainnetWallet);
    }

    console.log(wallet);
  } catch (e) {
    if (e instanceof InvalidConstructorParametersError) {
      console.log('Please populate your .env file with the correct values');
      process.exit(1);
    }

    throw e;
  }
})();
