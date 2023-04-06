import { Network, Tenderly, Web3Address } from '../lib';
import { Interface } from 'ethers';
import { ApiError } from '../lib/errors/ApiError';

jest.setTimeout(60000);

let tenderly: Tenderly = null;

const counterContract = '0x93Cc0A80DE37EC4A4F97240B9807CDdfB4a19fB1'.toLowerCase() as Web3Address;
const callerAddress = '0xDBcB6Db1FFEaA10cd157F985a8543261250eFA46'.toLowerCase() as Web3Address;

const counterContractAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'method',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
    ],
    name: 'CounterChanged',
    type: 'event',
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
    name: 'inc',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
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
];

const counterContractAbiInterface = new Interface(counterContractAbi);

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.SEPOLIA,
  });

  await tenderly.contracts.add(counterContract);
});

test('simulateTransaction works', async () => {
  const transaction = await tenderly.simulator.simulateTransaction({
    transaction: {
      from: callerAddress,
      to: counterContract,
      gas: 20000000,
      gas_price: '19419609232',
      value: 0,
      input: counterContractAbiInterface.encodeFunctionData('inc', []),
    },
    blockNumber: 3237677,
  });

  const [eventName, previousValue, newValue, caller] = counterContractAbiInterface
    .parseLog(transaction.logs[0].raw)
    .args.toArray();

  expect(eventName).toBe('Increment');
  expect(previousValue).toBe(BigInt(0));
  expect(newValue).toBe(BigInt(1));
  expect(caller.toLowerCase()).toBe(callerAddress);
});

test('simulateTransaction works with overrides', async () => {
  const transaction = await tenderly.simulator.simulateTransaction({
    transaction: {
      from: callerAddress,
      to: counterContract,
      gas: 20000000,
      gas_price: '19419609232',
      value: 0,
      input: counterContractAbiInterface.encodeFunctionData('inc', []),
    },
    blockNumber: 3237677,
    overrides: {
      [counterContract]: {
        state: {
          count: '66',
        },
      },
    },
  });

  const [eventName, previousValue, newValue, caller] = counterContractAbiInterface
    .parseLog(transaction.logs[0].raw)
    .args.toArray();

  expect(eventName).toBe('Increment');
  expect(previousValue).toBe(BigInt(66));
  expect(newValue).toBe(BigInt(67));
  expect(caller.toLowerCase()).toBe(callerAddress);
});

test('simulateTransaction throws when block number is set to high', async () => {
  try {
    await tenderly.simulator.simulateTransaction({
      transaction: {
        from: callerAddress,
        to: counterContract,
        gas: 20000000,
        gas_price: '19419609232',
        value: 0,
        input: counterContractAbiInterface.encodeFunctionData('inc', []),
      },
      blockNumber: 999999999999,
    });
  } catch (error) {
    expect(error instanceof ApiError).toBeTruthy();
    // FIXME: this should be fixed on new route
    // expect(error.slug).toBe('invalid_transaction_simulation');
    // expect(error.message).toBe('Unknown block number');
  }
});

test('simulateBundle works', async () => {
  const simulationBundle = await tenderly.simulator.simulateBundle({
    transactions: [
      {
        from: callerAddress,
        to: counterContract,
        gas: 20000000,
        gas_price: '19419609232',
        value: 0,
        input: counterContractAbiInterface.encodeFunctionData('inc', []),
      },
      {
        from: callerAddress,
        to: counterContract,
        gas: 20000000,
        gas_price: '19419609232',
        value: 0,
        input: counterContractAbiInterface.encodeFunctionData('inc', []),
      },
    ],
    blockNumber: 3237677,
  });

  const firstLog = counterContractAbiInterface
    .parseLog(simulationBundle[0].logs[0].raw)
    .args.toArray();

  expect(firstLog[0]).toBe('Increment'); // method
  expect(firstLog[1]).toBe(BigInt(0)); // oldNumber
  expect(firstLog[2]).toBe(BigInt(1)); // newNumber
  expect(firstLog[3].toLowerCase()).toBe(callerAddress);

  const secondLog = counterContractAbiInterface
    .parseLog(simulationBundle[1].logs[0].raw)
    .args.toArray();

  expect(secondLog[0]).toBe('Increment'); // method
  expect(secondLog[1]).toBe(BigInt(1)); // oldNumber
  expect(secondLog[2]).toBe(BigInt(2)); // newNumber
  expect(secondLog[3].toLowerCase()).toBe(callerAddress);
});

afterAll(async () => {
  await tenderly.contracts.remove(counterContract);
});
