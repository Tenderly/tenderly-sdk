import { Interface } from 'ethers';
import dotenv from 'dotenv';
import { myTokenAbi } from './myTokenAbi';
import { Tenderly, Network, InvalidArgumentsError, Web3Address } from '../../lib';
import { RawEvent } from '../../lib/executors/Simulator.types';

dotenv.config();

const myTokenAddress = '0x912043e00a14a6b79f5e500c825b1439e812d7ce'.toLowerCase() as Web3Address;

const fromWalletAddress = '0x8d1d4e2b8b9b1b4b9e0d0d6d7c7c4e4e8d9d00e0'.toLowerCase() as Web3Address;

const toWalletAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46'.toLowerCase() as Web3Address;

const myTokenAbiInterface = new Interface(myTokenAbi);

(async () => {
  try {
    const tenderly = new Tenderly({
      accessKey: process.env.TENDERLY_ACCESS_KEY || '',
      accountName: process.env.TENDERLY_ACCOUNT_NAME || '',
      projectName: process.env.TENDERLY_PROJECT_NAME || '',
      network: Network.SEPOLIA,
    });

    const simulations = await tenderly.simulator.simulateBundle({
      transactions: [
        {
          from: fromWalletAddress,
          to: myTokenAddress,
          gas: 0,
          gas_price: '0',
          value: 0,
          input: myTokenAbiInterface.encodeFunctionData('approve', [toWalletAddress, 1234567890]),
        },
        {
          from: toWalletAddress,
          to: myTokenAddress,
          gas: 0,
          gas_price: '0',
          value: 0,
          input: myTokenAbiInterface.encodeFunctionData('transferFrom', [
            fromWalletAddress,
            toWalletAddress,
            1234567890,
          ]),
        },
      ],
      blockNumber: 3262454,
      overrides: {
        [myTokenAddress]: {
          state: {
            [`_balances[${fromWalletAddress}]`]: '1234567891',
          },
        },
      },
    });

    if (!simulations || simulations.length !== 2) {
      throw new Error('Simulation bundle is invalid');
    }

    const allLogs = simulations
      .map(simulation => simulation.logs)
      .reduce((acc, logs) => (logs && acc ? [...acc, ...logs] : acc), []);

    if (!allLogs || allLogs.length !== 3) {
      throw new Error('Simulation bundle failed to return all logs');
    }

    // parse raw logs
    const [firstApprovalLog, secondApprovalLog, transferLog] = allLogs.map(log =>
      myTokenAbiInterface?.parseLog(log.raw as RawEvent),
    );

    console.log('Approval logs:', [firstApprovalLog, secondApprovalLog]);

    console.log('Transfer log:', transferLog);
  } catch (e) {
    if (e instanceof InvalidArgumentsError) {
      console.log('Please populate your .env file with the correct values');
      process.exit(1);
    }

    console.log(e.response);
  }
})();
