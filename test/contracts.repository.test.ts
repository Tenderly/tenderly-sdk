import { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { Tenderly, Network, SolidityCompilerVersions } from '../lib';

dotenv.config();

let tenderly: Tenderly = null;
let rinkebyTenderly: Tenderly = null;
let getByTenderly: Tenderly = null;

jest.setTimeout(30000);

const lidoContract = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'.toLowerCase();
const counterContract = '0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057'.toLowerCase();
const kittyCoreContract = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();
const wrappedEtherContract = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
const beaconDepositContract = '0x00000000219ab540356cBB839Cbe05303d7705Fa'.toLowerCase();
const bitDAOTreasuryContract = '0x78605Df79524164911C144801f41e9811B7DB73D'.toLowerCase();
const arbitrumBridgeContract = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a'.toLowerCase();

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  rinkebyTenderly = tenderly.with({ network: Network.RINKEBY });

  getByTenderly = tenderly.with({ projectName: process.env.TENDERLY_GET_BY_PROJECT_NAME });

  await Promise.all([
    tenderly.contracts.add(kittyCoreContract),
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
    const lidoContractResponse = tenderly.contracts.add(lidoContract);

    await expect(lidoContractResponse).resolves.toEqual(
      expect.objectContaining({
        address: lidoContract,
      }),
    );
  });

  test('adding contract data will successfuly update contract', async () => {
    const lidoContractResponse = tenderly.contracts.add(lidoContract, {
      displayName: 'Lido',
      tags: ['staking', 'eth2'],
      network: Network.MAINNET,
    });

    await expect(lidoContractResponse).resolves.toEqual(
      expect.objectContaining({
        address: lidoContract,
        displayName: 'Lido',
        tags: expect.arrayContaining(['staking', 'eth2']),
      }),
    );
  });

  test('returns contract, if it already exists', async () => {
    await tenderly.contracts.add(lidoContract);
    const lidoContractResponse = tenderly.contracts.add(lidoContract);

    await expect(lidoContractResponse).resolves.toEqual(
      expect.objectContaining({
        address: lidoContract,
      }),
    );
  });
});

describe('contracts.remove', () => {
  test('returns falsy value if contract exists', async () => {
    const removeContractResponse = tenderly.contracts.remove(arbitrumBridgeContract);

    await expect(removeContractResponse).resolves.toBeFalsy();
  });

  test("returns false value if contract doesn't exist", async () => {
    const removeContractResponse = tenderly.contracts.remove('0xfake_contract_address');

    await expect(removeContractResponse).resolves.toBeFalsy();
  });
});

describe('contracts.get', () => {
  test('returns contract if it exists', async () => {
    const contractResponse = tenderly.contracts.get(kittyCoreContract);

    await expect(contractResponse).resolves.toEqual(
      expect.objectContaining({
        address: kittyCoreContract,
      }),
    );
  });

  test('returns undefined if contract does not exist', async () => {
    const contractResponse = tenderly.contracts.get('0xfake_contract_address');

    await expect(contractResponse).resolves.toBeUndefined();
  });
});

describe('contracts.update', () => {
  beforeEach(async () => {
    await tenderly.contracts.add(wrappedEtherContract);
  });

  afterEach(async () => {
    await tenderly.contracts.remove(wrappedEtherContract);
  });

  test("doesn't throw an error when called correctly", async () => {
    const updateContractResponse = tenderly.contracts.update(wrappedEtherContract, {
      displayName: 'NewDisplayName',
      appendTags: ['NewTag', 'NewTag2'],
    });

    await expect(updateContractResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherContract,
        displayName: 'NewDisplayName',
        tags: expect.arrayContaining(['NewTag', 'NewTag2']),
      }),
    );
  });

  test('updates only displayName', async () => {
    const contractResponse = tenderly.contracts.update(wrappedEtherContract, {
      displayName: 'NewDisplayName',
    });

    await expect(contractResponse).resolves.toBeDefined();
    await expect(contractResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherContract,
        displayName: 'NewDisplayName',
      }),
    );
  });

  test('updates only tags', async () => {
    const contractResponse = tenderly.contracts.update(wrappedEtherContract, {
      appendTags: ['NewTag', 'NewTag2'],
    });

    await expect(contractResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherContract,
        tags: expect.arrayContaining(['NewTag', 'NewTag2']),
      }),
    );
    // expect display name to be 'NewDisplayName' or not defined
    await expect(contractResponse).resolves.not.toBe(
      expect.objectContaining({
        displayName: expect.anything(),
      }),
    );
  });
});

describe('contracts.verify', () => {
  test('contracts.verify works for correct config', async () => {
    const result = await rinkebyTenderly.contracts.verify(counterContract, {
      config: {
        mode: 'public',
      },
      solc: {
        compiler: {
          version: SolidityCompilerVersions.v0_8_13,
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
            name: 'Counter',
            source: `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.13;

              contract Counter {
                uint public count;

                // Function to get the current count
                function get() public view returns (uint) {
                  return count;
                }

                // Function to increment count by 1
                function inc() public {
                  count += 1;
                }

                // Function to decrement count by 1
                function dec() public {
                  count -= 1;
                }
              }
            `,
          },
        },
      },
    });

    expect(result).toBeDefined();
  });

  test('contracts.verify fails for wrong compiler version', async () => {
    expect(
      async () =>
        await rinkebyTenderly.contracts.verify(counterContract, {
          config: {
            mode: 'public',
          },
          solc: {
            compiler: {
              version: SolidityCompilerVersions.v0_8_4,
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
                name: 'Counter',
                source: `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.17;

              contract Counter {
                uint public count;

                // Function to get the current count
                function get() public view returns (uint) {
                  return count;
                }

                // Function to increment count by 1
                function inc() public {
                  count += 1;
                }

                // Function to decrement count by 1
                function dec() public {
                  count -= 1;
                }
              }
            `,
              },
            },
          },
        }),
    ).rejects.toThrow(AxiosError);
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
    await getByTenderly.contracts.update(beaconDepositContract, {
      displayName: beaconDepositContractDisplayName,
      appendTags: beaconDepositContractTags,
    });
    await getByTenderly.contracts.update(bitDAOTreasuryContract, {
      displayName: bitDAOTreasuryContractDisplayName,
      appendTags: bitDAOTreasuryContractTags,
    });
  });

  describe('tags', () => {
    test('returns 1 contract, when 1 tag matches (passed as 1 string, not an array)', async () => {
      const contracts = await getByTenderly.contracts.getBy({ tags: tag1 });

      expect(contracts).toHaveLength(1);
      expect(contracts[0].address).toEqual(beaconDepositContract);
      expect(contracts[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contracts[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
    });

    test('returns 0 contracts, when no tags match', async () => {
      const contractsResponse = getByTenderly.contracts.getBy({ tags: ['non existing tag'] });

      await expect(contractsResponse).resolves.toHaveLength(0);
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

    test('returns 4 contracts, when no tags are passed', async () => {
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
        displayName: beaconDepositContractDisplayName,
      });

      expect(contractsResponse).toHaveLength(1);
      expect(contractsResponse[0].address).toEqual(beaconDepositContract);
      expect(contractsResponse[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contractsResponse[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
    });

    test('returns 0 contracts, when displayName does not match', async () => {
      const contracts = await getByTenderly.contracts.getBy({
        displayName: 'non existing display name',
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
          displayName: [beaconDepositContractDisplayName, bitDAOTreasuryContractDisplayName],
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

  describe('network', () => {
    test('returns 2 contracts, when network matches', async () => {
      const contractsResponse = (
        await getByTenderly.contracts.getBy({ network: Network.MAINNET })
      ).sort((a, b) => (a.address > b.address ? 1 : -1));

      expect(contractsResponse).toHaveLength(2);
      expect(contractsResponse[0].address).toEqual(beaconDepositContract);
      expect(contractsResponse[0].displayName).toEqual(beaconDepositContractDisplayName);
      expect(contractsResponse[0].tags.sort()).toEqual(beaconDepositContractTags.sort());
      expect(contractsResponse[1].address).toEqual(bitDAOTreasuryContract);
      expect(contractsResponse[1].displayName).toEqual(bitDAOTreasuryContractDisplayName);
      expect(contractsResponse[1].tags.sort()).toEqual(bitDAOTreasuryContractTags.sort());
    });

    test('returns 0 contracts, when network does not match', async () => {
      const contractsResponse = getByTenderly.contracts.getBy({ network: Network.ROPSTEN });

      await expect(contractsResponse).resolves.toHaveLength(0);
    });

    test('returns 2 contracts, when network is not passed', async () => {
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

    test('returns 2 contracts, empty array is passed', async () => {
      const contractsResponse = (
        await getByTenderly.contracts.getBy({
          network: [],
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
