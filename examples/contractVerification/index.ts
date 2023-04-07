import dotenv from 'dotenv';
import { Tenderly, Network, Web3Address } from '../../lib';
import { source } from './myToken';

dotenv.config();

const myTokenAddres = '0x8aaf9071e6c3129653b2dc39044c3b79c0bfcfbf'.toLowerCase() as Web3Address;

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
          version: 'v0.8.18',
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
