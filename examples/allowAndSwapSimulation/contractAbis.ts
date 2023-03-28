export const approveContractAbi = [
  {
    type: 'function',
    name: 'approve',
    constant: false,
    anonymous: false,
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        storage_location: 'default',
        components: null,
        offset: 0,
        index: '0x0000000000000000000000000000000000000000000000000000000000000000',
        indexed: false,
        simple_type: {
          type: 'address',
        },
      },
      {
        name: 'amount',
        type: 'uint256',
        storage_location: 'default',
        components: null,
        offset: 0,
        index: '0x0000000000000000000000000000000000000000000000000000000000000000',
        indexed: false,
        simple_type: {
          type: 'uint',
        },
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        storage_location: 'default',
        components: null,
        offset: 0,
        index: '0x0000000000000000000000000000000000000000000000000000000000000000',
        indexed: false,
        simple_type: {
          type: 'bool',
        },
      },
    ],
  },
];

export const universalRouterContractAbi = [
  {
    type: 'function',
    name: 'execute',
    constant: false,
    anonymous: false,
    stateMutability: 'payable',
    inputs: [
      {
        name: 'commands',
        type: 'bytes',
        storage_location: 'default',
        components: null,
        offset: 0,
        index: '0x0000000000000000000000000000000000000000000000000000000000000000',
        indexed: false,
        simple_type: {
          type: 'bytes',
        },
      },
      {
        name: 'inputs',
        type: 'bytes[]',
        storage_location: 'default',
        components: null,
        offset: 0,
        index: '0x0000000000000000000000000000000000000000000000000000000000000000',
        indexed: false,
        simple_type: {
          type: 'slice',
          nested_type: {
            type: 'bytes',
          },
        },
      },
    ],
    outputs: [],
  },
];
