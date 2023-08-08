import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { Tenderly, Network, Web3Address, getEnvironmentVariables } from '../../../lib';

dotenv.config();

const libraryTokenContract =
  '0xbeba0016bd2fff7c81c5877cc0fcc509760785b5'.toLowerCase() as Web3Address;
const libraryContract = '0xcA00A6512792aa89e347c713F443b015A1006f1d'.toLowerCase();

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: getEnvironmentVariables().TENDERLY_ACCESS_KEY,
      accountName: getEnvironmentVariables().TENDERLY_ACCOUNT_NAME,
      projectName: getEnvironmentVariables().TENDERLY_PROJECT_NAME,
      network: Network.SEPOLIA,
    });

    const result = await tenderly.contracts.verify(libraryTokenContract, {
      config: {
        mode: 'public',
      },
      contractToVerify: 'LibraryToken.sol:LibraryToken',
      solc: {
        version: 'v0.8.17',
        sources: {
          'LibraryToken.sol': {
            content: readFileSync(
              'examples/contractVerification/withLibrary/contracts/LibraryToken.sol',
              'utf8',
            ),
          },
          'Library.sol': {
            content: readFileSync(
              'examples/contractVerification/withLibrary/contracts/Library.sol',
              'utf8',
            ),
          },
        },
        settings: {
          libraries: {
            'Library.sol': {
              Library: libraryContract,
            },
          },
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    });

    console.log('Result:', result);
  } catch (error) {
    console.error(error);
  }
})();
