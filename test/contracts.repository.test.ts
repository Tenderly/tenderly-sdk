import { Tenderly, Network } from '../lib';
import { NotFoundError } from '../lib/errors/NotFoundError';
import { CompilationError } from '../lib/errors/CompilationError';
import { BytecodeMismatchError } from '../lib/errors/BytecodeMismatchError';

const counterContractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CounterWithLogs {
  uint public count;

  event CounterChanged(
    string method,
    uint256 oldNumber,
    uint256 newNumber,
    address caller
  );

  // Function to get the current count
  function get() public view returns (uint) {
    return count;
  }

  // Function to increment count by 1
  function inc() public {
    emit CounterChanged("Increment", count, count + 1, msg.sender);
    count += 1;
  }

  // Function to decrement count by 1
  function dec() public {
    emit CounterChanged("Decrement", count, count - 1, msg.sender);

    count -= 1;
  }
}
`;

const bytecodeMismatchCounterContractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CounterWithLogs {
  uint public count;

  event CounterChanged(
    string method,
    uint256 oldNumber,
    uint256 newNumber,
    address caller
  );

  // Function to get the current count
  function get() public view returns (uint) {
    return count;
  }

  // Function to increment count by 1
  function inc() public {
    emit CounterChanged("Increment", count, count + 1, msg.sender);
    count += 1;
  }

  // Function to decrement count by 1
  function dec() public {
    emit CounterChanged("Decrement", count, count - 1, msg.sender);

    count -= 1;
  }

  // Has an additional 'inc2' function that is not in the original contract
  function inc2() public {
    emit CounterChanged("Increment", count, count + 2, msg.sender);
    count += 2;
  }
}
`;

const libraryTokenContractSource = `
//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity 0.8.17;

import "./Library.sol";

contract LibraryToken {
    uint public dummyToken = 1;

    constructor() {
        dummyToken = 2;
    }

    function add(uint a, uint b) public pure returns (uint) {
        return Library.add(a, b);
    }
}
`;

const libraryContractSource = `
//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity 0.8.17;

library Library {
    function add(uint a, uint b) public pure returns (uint) {
        return a + b;
    }
}
`;

let tenderly: Tenderly = null;
let sepoliaTenderly: Tenderly = null;
let getByTenderly: Tenderly = null;

jest.setTimeout(60000);

const lidoContract = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'.toLowerCase();
const counterContract = '0x8AAF9071E6C3129653B2dC39044C3B79c0bFCfBF'.toLowerCase();
const libraryTokenContract = '0xbeba0016bd2fff7c81c5877cc0fcc509760785b5'.toLowerCase();
const libraryContract = '0xcA00A6512792aa89e347c713F443b015A1006f1d'.toLowerCase();
const kittyCoreContract = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();
const wrappedEtherContract = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
const beaconDepositContract = '0x00000000219ab540356cBB839Cbe05303d7705Fa'.toLowerCase();
const bitDAOTreasuryContract = '0x78605Df79524164911C144801f41e9811B7DB73D'.toLowerCase();
const arbitrumBridgeContract = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a'.toLowerCase();
const unverifiedContract = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'.toLowerCase();

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  sepoliaTenderly = tenderly.with({ network: Network.SEPOLIA });

  getByTenderly = tenderly.with({ projectName: process.env.TENDERLY_GET_BY_PROJECT_NAME });

  await Promise.all([
    tenderly.contracts.add(kittyCoreContract),
    tenderly.contracts.add(unverifiedContract, { displayName: 'Unverified Contract' }),
    tenderly.contracts.add(wrappedEtherContract),
    tenderly.contracts.add(arbitrumBridgeContract),
    getByTenderly.contracts.add(beaconDepositContract),
    getByTenderly.contracts.add(bitDAOTreasuryContract),
  ]);
});

afterAll(async () => {
  await Promise.all([
    tenderly.contracts.remove(lidoContract),
    tenderly.contracts.remove(kittyCoreContract),
    tenderly.contracts.remove(wrappedEtherContract),
    tenderly.contracts.remove(arbitrumBridgeContract),
    getByTenderly.contracts.remove(beaconDepositContract),
    getByTenderly.contracts.remove(bitDAOTreasuryContract),
  ]);
});

test('Tenderly has contracts namespace', () => {
  expect(tenderly.contracts).toBeDefined();
});

describe('contracts.add', () => {
  beforeEach(async () => {
    await tenderly.contracts.remove(lidoContract);
  });

  test('successfully adds contract', async () => {
    const contract = await tenderly.contracts.add(lidoContract);

    expect(contract.address).toEqual(lidoContract);
  });

  test(`adding contract twice doesn't throw an error`, async () => {
    await tenderly.contracts.add(lidoContract);
    const contract = await tenderly.contracts.add(lidoContract);
    expect(contract.address).toEqual(lidoContract);
  });

  test('adding contract data will successfully add with specified data', async () => {
    const lidoContractResponse = await tenderly.contracts.add(lidoContract, {
      displayName: 'Lido',
    });

    expect(lidoContractResponse.address).toEqual(lidoContract);
    expect(lidoContractResponse.displayName).toEqual('Lido');
    // tags don't work yet
    // expect(lidoContractResponse.tags.sort()).toEqual(['eth2', 'staking']);
  });

  test('returns contract, if it already exists', async () => {
    await tenderly.contracts.add(lidoContract);
    const contract = await tenderly.contracts.add(lidoContract);

    expect(contract.address).toEqual(lidoContract);
  });

  // TODO: decide whether we want to update contract if it already exists
  // test("doesn't update contract if it already exists", async () => {
  //   await tenderly.contracts.add(lidoContract, {
  //     displayName: 'NewDisplayName1',
  //     tags: ['NewTag1'],
  //   });
  //   const contract = await tenderly.contracts.add(lidoContract, {
  //     displayName: 'NewDisplayName2',
  //     tags: ['NewTag2'],
  //   });

  //   expect(contract.address).toEqual(lidoContract);
  //   expect(contract.displayName).toEqual('NewDisplayName1');
  //   // tags don't work yet
  //   // expect(contract.tags.sort()).toEqual(['eth2', 'staking']);
  // });
});

describe('contracts.remove', () => {
  test('removes contract', async () => {
    try {
      await tenderly.contracts.remove(arbitrumBridgeContract);
      await tenderly.contracts.get(arbitrumBridgeContract);
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(error.slug).toEqual('resource_not_found');
    }
  });

  // test("returns falsy value if contract doesn't exist", async () => {
  //   await tenderly.contracts.remove('0xfake_contract_address');

  //   expect(removeContractResponse).toBeFalsy();
  // });
});

describe('contracts.get', () => {
  test('returns contract if it exists', async () => {
    const contract = await tenderly.contracts.get(kittyCoreContract);

    expect(contract.address).toEqual(kittyCoreContract);
  });

  test('returns unverified contract if it exists', async () => {
    const contract = await tenderly.contracts.get(unverifiedContract);
    expect(contract.address).toEqual(unverifiedContract);
  });

  test("throws 400 error with non_existing_contract slug if contract doesn't exist on project", async () => {
    try {
      await tenderly.contracts.get('0xfake_contract_address');
      throw new Error('Should not be here');
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(error.slug).toEqual('resource_not_found');
    }
  });
});

describe('contracts.update', () => {
  beforeEach(async () => {
    await tenderly.contracts.add(wrappedEtherContract);
  });

  afterEach(async () => {
    await tenderly.contracts.remove(wrappedEtherContract);
  });

  test('updates tags and display name if both are passed', async () => {
    const contract = await tenderly.contracts.update(wrappedEtherContract, {
      displayName: 'NewDisplayName',
      appendTags: ['NewTag', 'NewTag2'],
    });

    expect(contract.address).toEqual(wrappedEtherContract);
    expect(contract.displayName).toEqual('NewDisplayName');
    expect(contract.tags.sort()).toEqual(['NewTag', 'NewTag2']);
  });

  test('updates only displayName', async () => {
    const contractResponse = await tenderly.contracts.update(wrappedEtherContract, {
      displayName: 'NewDisplayName',
    });

    expect(contractResponse.address).toEqual(wrappedEtherContract);
    expect(contractResponse.displayName).toEqual('NewDisplayName');
  });

  test('updates only tags', async () => {
    const contract = await tenderly.contracts.update(wrappedEtherContract, {
      appendTags: ['NewTag', 'NewTag2'],
    });

    expect(contract.address).toEqual(wrappedEtherContract);
    expect(contract.tags.sort()).toEqual(['NewTag', 'NewTag2']);
    expect(contract.displayName).toBeUndefined();
  });
});

describe('contracts.verify', () => {
  beforeAll(async () => {
    await sepoliaTenderly.contracts.add(counterContract);
  });

  afterAll(async () => {
    await sepoliaTenderly.contracts.remove(counterContract);
  });

  test('contracts.verify works for correct config', async () => {
    const result = await sepoliaTenderly.contracts.verify(counterContract, {
      config: {
        mode: 'public', // 'private' is also possible
      },
      contractToVerify: 'Counter.sol:CounterWithLogs',
      solc: {
        version: 'v0.8.18',
        sources: {
          'Counter.sol': {
            content: counterContractSource,
          },
        },
        settings: {
          libraries: {},
          optimizer: {
            enabled: false,
          },
        },
      },
    });

    expect(result.address).toEqual(counterContract);
  });

  test('contracts.verify works for contract with libraries', async () => {
    const result = await sepoliaTenderly.contracts.verify(libraryTokenContract, {
      config: {
        mode: 'public', // 'private' is also possible
      },
      contractToVerify: 'LibraryToken.sol:LibraryToken',
      solc: {
        version: 'v0.8.17',
        sources: {
          'LibraryToken.sol': {
            content: libraryTokenContractSource,
          },
          'Library.sol': {
            content: libraryContractSource,
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

    expect(result.address).toEqual(libraryTokenContract);
  });

  test('contracts.verify fails for wrong compiler version', async () => {
    try {
      await sepoliaTenderly.contracts.verify(counterContract, {
        config: {
          mode: 'public',
        },
        contractToVerify: 'Counter.sol:CounterWithLogs',
        solc: {
          version: 'v0.8.4',
          sources: {
            'Counter.sol': {
              content: counterContractSource,
            },
          },
          settings: {
            libraries: {},
            optimizer: {
              enabled: false,
            },
          },
        },
      });
    } catch (error) {
      expect(error instanceof CompilationError).toBeTruthy();
      expect(error.slug).toEqual('compilation_error');
    }
  });
  test('contracts.verify fails for bytecode mismatch error', async () => {
    try {
      await sepoliaTenderly.contracts.verify(counterContract, {
        config: {
          mode: 'public',
        },
        contractToVerify: 'Counter.sol:CounterWithLogs',
        solc: {
          version: 'v0.8.18',
          sources: {
            'Counter.sol': {
              content: bytecodeMismatchCounterContractSource,
            },
          },
          settings: {
            libraries: {},
            optimizer: {
              enabled: false,
            },
          },
        },
      });
    } catch (error) {
      expect(error instanceof BytecodeMismatchError).toBeTruthy();
      expect(error.slug).toEqual('bytecode_mismatch_error');
    }
  });
});

describe('contract.getBy', () => {
  const beaconDepositContractDisplayName = 'Contract1';
  const bitDAOTreasuryContractDisplayName = 'Contract2';
  const tag1 = 'Tag1';
  const tag2 = 'Tag2';
  const tag3 = 'Tag3';
  const beaconDepositContractTags = [tag1, tag2];
  const bitDAOTreasuryContractTags = [tag2, tag3];

  beforeAll(async () => {
    await Promise.all([
      getByTenderly.contracts.update(beaconDepositContract, {
        displayName: beaconDepositContractDisplayName,
        appendTags: beaconDepositContractTags,
      }),
      getByTenderly.contracts.update(bitDAOTreasuryContract, {
        displayName: bitDAOTreasuryContractDisplayName,
        appendTags: bitDAOTreasuryContractTags,
      }),
    ]);
  });

  describe('tags', () => {
    test('returns 1 contract, when 1 tag matches (passed as 1 string, not an array)', async () => {
      const contracts = await getByTenderly.contracts.getBy({ tags: [tag1] });

      expect(contracts).toHaveLength(1);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
    });

    test('returns 0 contracts, when no tags match', async () => {
      const contracts = await getByTenderly.contracts.getBy({ tags: ['non existing tag'] });

      expect(contracts).toHaveLength(0);
    });

    test('returns 1 contract, when `tag1` matches', async () => {
      const contracts = await getByTenderly.contracts.getBy({
        tags: [tag1],
      });

      expect(contracts).toHaveLength(1);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(beaconDepositContractTags));
    });

    test('returns 2 contracts, when `tag2` matches', async () => {
      const contracts = (await getByTenderly.contracts.getBy({ tags: [tag2] })).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(contracts).toHaveLength(2);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(beaconDepositContractTags));
      expect(contracts[1].address).toEqual(bitDAOTreasuryContract);
      expect(contracts[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contracts[1].tags.sort()).toEqual(expect.arrayContaining(bitDAOTreasuryContractTags));
    });

    test('returns 1 contract, when `tag3` matches', async () => {
      const contracts = await getByTenderly.contracts.getBy({ tags: [tag3] });

      expect(contracts).toHaveLength(1);
      expect(contracts[0].address).toEqual(bitDAOTreasuryContract);
      expect(contracts[0].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(bitDAOTreasuryContractTags));
    });

    test('returns 2 contracts, when any of 3 tags match', async () => {
      const contracts = (await getByTenderly.contracts.getBy({ tags: [tag1, tag2, tag3] })).sort(
        (a, b) => (a.address > b.address ? 1 : -1),
      );

      expect(contracts).toHaveLength(2);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(beaconDepositContractTags));
      expect(contracts[1].address).toEqual(bitDAOTreasuryContract);
      expect(contracts[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contracts[1].tags.sort()).toEqual(expect.arrayContaining(bitDAOTreasuryContractTags));
    });

    test("returns 2 contracts, when both tags that don't overlap are passed", async () => {
      const contracts = (await getByTenderly.contracts.getBy({ tags: [tag1, tag3] })).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(contracts).toHaveLength(2);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(beaconDepositContractTags));
      expect(contracts[1].address).toEqual(bitDAOTreasuryContract);
      expect(contracts[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contracts[1].tags.sort()).toEqual(expect.arrayContaining(bitDAOTreasuryContractTags));
    });

    test('returns 2 contracts, when no tags are passed', async () => {
      const contracts = (await getByTenderly.contracts.getBy()).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(contracts).toHaveLength(2);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(beaconDepositContractTags));
      expect(contracts[1].address).toEqual(bitDAOTreasuryContract);
      expect(contracts[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contracts[1].tags.sort()).toEqual(expect.arrayContaining(bitDAOTreasuryContractTags));
    });

    test('returns 2 contracts, when empty tags array is passed', async () => {
      const contracts = (await getByTenderly.contracts.getBy({ tags: [] })).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(contracts).toHaveLength(2);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(expect.arrayContaining(beaconDepositContractTags));
      expect(contracts[1].address).toEqual(bitDAOTreasuryContract);
      expect(contracts[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contracts[1].tags.sort()).toEqual(expect.arrayContaining(bitDAOTreasuryContractTags));
    });
  });

  describe('displayName', () => {
    test('returns 1 contract, when displayName matches', async () => {
      const contractsResponse = await getByTenderly.contracts.getBy({
        displayNames: [beaconDepositContractDisplayName],
      });

      expect(contractsResponse).toHaveLength(1);
      expect(contractsResponse[0].address).toEqual(beaconDepositContract);
      expect(contractsResponse[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contractsResponse[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
    });

    test('returns 0 contracts, when displayName does not match', async () => {
      const contracts = await getByTenderly.contracts.getBy({
        displayNames: ['non existing display name'],
      });

      expect(contracts).toHaveLength(0);
    });

    test('returns 2 contracts, when displayName is not passed', async () => {
      const contractsResponse = (await getByTenderly.contracts.getBy()).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(contractsResponse).toHaveLength(2);
      expect(contractsResponse[0].address).toEqual(beaconDepositContract);
      expect(contractsResponse[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contractsResponse[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
      expect(contractsResponse[1].address).toEqual(bitDAOTreasuryContract);
      expect(contractsResponse[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contractsResponse[1].tags.sort()).toEqual(bitDAOTreasuryContractTags.sort());
    });

    test('returns 2 contracts, when both displayNames match', async () => {
      const contractsResponse = (
        await getByTenderly.contracts.getBy({
          displayNames: [beaconDepositContractDisplayName, bitDAOTreasuryContractDisplayName],
        })
      ).sort((a, b) => (a.address > b.address ? 1 : -1));

      expect(contractsResponse).toHaveLength(2);
      expect(contractsResponse[0].address).toEqual(beaconDepositContract);
      expect(contractsResponse[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contractsResponse[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
      expect(contractsResponse[1].address).toEqual(bitDAOTreasuryContract);
      expect(contractsResponse[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contractsResponse[1].tags.sort()).toEqual(bitDAOTreasuryContractTags.sort());
    });
  });
});

test('Tenderly.with() overide works', () => {
  const newHandle = tenderly.with({ accountName: 'newAccountName' });
  expect(newHandle.configuration.accountName).toEqual('newAccountName');
});
