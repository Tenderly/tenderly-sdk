import dotenv from 'dotenv';
import { Tenderly, Network, InvalidArgumentsError, getEnvironmentVariables } from '../../lib';

dotenv.config();

try {
  const tenderly = new Tenderly({
    accessKey: getEnvironmentVariables().TENDERLY_ACCESS_KEY,
    accountName: getEnvironmentVariables().TENDERLY_ACCOUNT_NAME,
    projectName: getEnvironmentVariables().TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  const unverifiedContractAddress = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'.toLowerCase();
  const daiContract = '0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase();

  (async () => {
    const unverifiedContract = await tenderly.contracts.add(unverifiedContractAddress, {
      displayName: 'Unverified Contract',
    });
    const verifiedContract = await tenderly.contracts.add(daiContract);

    console.log(unverifiedContract);
    console.log(verifiedContract);
  })();
} catch (error) {
  console.error(error);

  if (error instanceof InvalidArgumentsError) {
    console.error(error.message);
    console.log(
      'Please provide a valid access key, account name and project name, by populating .env file.',
    );
  }

  process.exit(1);
}
