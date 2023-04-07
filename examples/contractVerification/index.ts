import dotenv from 'dotenv';
import { Tenderly, Network, Web3Address, SolidityCompilerVersions } from '../../lib';
import { source } from './myToken';

dotenv.config();

const myTokenAddres = '0xe2B2db0165CC69B850Fd86C3A73D05182838E684'.toLowerCase() as Web3Address;

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: process.env.TENDERLY_ACCESS_KEY,
      accountName: process.env.TENDERLY_ACCOUNT_NAME,
      projectName: process.env.TENDERLY_PROJECT_NAME,
      network: Network.SEPOLIA,
    });

    const result = await tenderly.contracts.verify(myTokenAddres, {
      config: {
        mode: 'public',
      },
      solc: {
        compiler: {
          version: SolidityCompilerVersions.v0_8_18,
          settings: {
            libraries: {},
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
        sources: {
          'Counter.sol': {
            name: 'CounterWithLogs',
            source,
          },
        },
      },
    });

    console.log('Result:', result);
  } catch (error) {
    console.error(error);
  }
})();
