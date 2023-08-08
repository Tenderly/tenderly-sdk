import dotenv from 'dotenv';
import { Tenderly, Network, InvalidArgumentsError, getEnvironmentVariables } from '../../lib';

dotenv.config();

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: getEnvironmentVariables().TENDERLY_ACCESS_KEY,
      accountName: getEnvironmentVariables().TENDERLY_ACCOUNT_NAME,
      projectName: getEnvironmentVariables().TENDERLY_PROJECT_NAME,
      network: Network.SEPOLIA,
    });

    const sepoliaWalletAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46'.toLowerCase();

    const wallet = await tenderly.wallets.add(sepoliaWalletAddress, {
      displayName: 'Sepolia Wallet',
    });

    console.log(wallet);
  } catch (error) {
    console.error(error);

    if (error instanceof InvalidArgumentsError) {
      console.error(
        'Please provide a valid access key, account name and project name, by populating .env file.',
      );
    }
  }
})();
