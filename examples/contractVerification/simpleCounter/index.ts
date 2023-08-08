import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { Tenderly, Network, Web3Address, getEnvironmentVariables } from '../../../lib';

dotenv.config();

const myTokenAddress = '0x8aaf9071e6c3129653b2dc39044c3b79c0bfcfbf'.toLowerCase() as Web3Address;

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: getEnvironmentVariables().TENDERLY_ACCESS_KEY,
      accountName: getEnvironmentVariables().TENDERLY_ACCOUNT_NAME,
      projectName: getEnvironmentVariables().TENDERLY_PROJECT_NAME,
      network: Network.SEPOLIA,
    });

    const result = await tenderly.contracts.verify(myTokenAddress, {
      config: {
        mode: 'public',
      },
      contractToVerify: 'Counter.sol:CounterWithLogs',
      solc: {
        version: 'v0.8.18',
        sources: {
          'Counter.sol': {
            content: readFileSync(
              'examples/contractVerification/simpleCounter/contracts/Counter.sol',
              'utf8',
            ),
          },
        },
        settings: {
          libraries: {},
          optimizer: {
            enabled: false,
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
