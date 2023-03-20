import { Network, Tenderly } from '../lib';
import { Interface } from 'ethers';

jest.setTimeout(25000);

let tenderly: Tenderly = null;

const counterContract = '0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057';
const nullAddress = '0x0000000000000000000000000000000000000000';

const abi = [
  {
    inputs: [],
    name: 'count',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'dec',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'inc',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const abiInterface = new Interface(abi);

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.RINKEBY,
  });

  await tenderly.contracts.add(counterContract);
});

test('simulateTransaction works', async () => {
  const transaction = await tenderly.simulator.simulateTransaction({
    transaction: {
      from: nullAddress,
      to: counterContract,
      input: abiInterface.encodeFunctionData('inc', []),
    },
    blockNumber: 12354651,
    override: {
      [counterContract]: {
        "value": {
          "count":
            "66"
        }
      }
    }
  });

  expect(transaction.timestamp).toBeDefined();
  expect(transaction.transaction_info.state_diff[0].dirty).toBe("67");

});

test('simulateBundle works', async () => {
  const simulationBundleResult = await tenderly.simulator.simulateBundle(
    [{
      transaction: {
        from: nullAddress,
        to: counterContract,
        input: abiInterface.encodeFunctionData('inc', []),
      },
      blockNumber: 12354651,
      override: {
        [counterContract]: {
          "value": {
            "count":
              "66"
          }
        }
      }
    }]
  );

  expect(simulationBundleResult.simulation_results[0].transaction.transaction_info.state_diff[0].dirty).toBe("67");
});

afterAll(async () => {
  await tenderly.contracts.remove(counterContract);
});
