import { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { Tenderly, Network, SolidityCompilerVersions } from '../lib';

dotenv.config();

let tenderly: Tenderly = null;
let rinkebyTenderly: Tenderly = null;

const lidoContract = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'.toLowerCase();
const counterContract = '0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057';
const kittyCoreContract = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();
const wrappedEtherContract = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
const beaconDepositContract = '0x00000000219ab540356cBB839Cbe05303d7705Fa'.toLowerCase();
const bitDAOTreasuryContract = '0x78605Df79524164911C144801f41e9811B7DB73D'.toLowerCase();
const arbitrumBridgeContract = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a'.toLowerCase();
const liquityActivePoolContract = '0xDf9Eb223bAFBE5c5271415C75aeCD68C21fE3D7F'.toLowerCase();
const canonicalTransactionChainContractAddress =
  '0x5E4e65926BA27467555EB562121fac00D24E9dD2'.toLowerCase();

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  rinkebyTenderly = tenderly.with({ network: Network.RINKEBY });

  await Promise.all([
    tenderly.contracts.add(kittyCoreContract),
    tenderly.contracts.add(wrappedEtherContract),
    tenderly.contracts.add(beaconDepositContract),
    tenderly.contracts.add(bitDAOTreasuryContract),
    tenderly.contracts.add(arbitrumBridgeContract),
    tenderly.contracts.add(liquityActivePoolContract),
    tenderly.contracts.add(canonicalTransactionChainContractAddress),
  ]);
});

afterAll(async () => {
  await Promise.all([
    tenderly.contracts.remove(lidoContract),
    tenderly.contracts.remove(kittyCoreContract),
    tenderly.contracts.remove(wrappedEtherContract),
    tenderly.contracts.remove(beaconDepositContract),
    tenderly.contracts.remove(bitDAOTreasuryContract),
    tenderly.contracts.remove(arbitrumBridgeContract),
    tenderly.contracts.remove(liquityActivePoolContract),
    tenderly.contracts.remove(canonicalTransactionChainContractAddress),
  ]);
});

test('Tenderly has contracts namespace', () => {
  expect(tenderly.contracts).toBeDefined();
});

describe('contracts.add', () => {
  test('successfully adds contract', async () => {
    const lidoContractResponse = tenderly.contracts.add(lidoContract);

    await expect(lidoContractResponse).resolves.toEqual(
      expect.objectContaining({
        address: lidoContract,
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

  beforeAll(() =>
    Promise.all([
      tenderly.contracts.add(beaconDepositContract, {
        network: Network.MAINNET,
        displayName: beaconDepositContractDisplayName,
        tags: beaconDepositContractTags,
      }),
      tenderly.contracts.add(bitDAOTreasuryContract, {
        network: Network.MAINNET,
        displayName: bitDAOTreasuryContractDisplayName,
        tags: bitDAOTreasuryContractTags,
      }),
    ]),
  );

  describe('tags', () => {
    test('returns 1 contract, when 1 tag matches (passed as 1 string, not an array)', () => {
      const contractsResponse = tenderly.contracts.getBy({ tags: tag1 });

      expect(contractsResponse).resolves.toHaveLength(1);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
        ]),
      );
    });

    test('returns 0 contracts, when no tags match', () => {
      const contractsResponse = tenderly.contracts.getBy({ tags: ['non existing tag'] });

      expect(contractsResponse).resolves.toHaveLength(0);
    });

    test('returns 1 contract, when 1 tag matches', () => {
      const beaconDepositContractsResponse = tenderly.contracts.getBy({
        tags: [tag1],
      });
      const bitDAOTreasuryContractResponse = tenderly.contracts.getBy({ tags: [tag3] });

      expect(beaconDepositContractsResponse).resolves.toHaveLength(1);
      expect(bitDAOTreasuryContractResponse).resolves.toHaveLength(1);
      expect(beaconDepositContractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
        ]),
      );
      expect(bitDAOTreasuryContractResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });

    test('returns 2 contracts, when any of 3 tags match', () => {
      const contractsResponse = tenderly.contracts.getBy({ tags: [tag1, tag2, tag3] });

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });

    test("returns 2 contracts, when both tags that don't overlap are passed", () => {
      const contractsResponse = tenderly.contracts.getBy({ tags: [tag1, tag3] });

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });

    test('returns 2 contracts, when no tags are passed', () => {
      const contractsResponse = tenderly.contracts.getBy();

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });

    test('returns 2 contracts, when empty tags array is passed', () => {
      const contractsResponse = tenderly.contracts.getBy({ tags: [] });

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });
  });

  describe('displayName', () => {
    test('returns 1 contract, when displayName matches', () => {
      const contractsResponse = tenderly.contracts.getBy({
        displayName: beaconDepositContractDisplayName,
      });

      expect(contractsResponse).resolves.toHaveLength(1);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
        ]),
      );
    });

    test('returns 0 contracts, when displayName does not match', () => {
      const contractsResponse = tenderly.contracts.getBy({
        displayName: 'non existing display name',
      });

      expect(contractsResponse).resolves.toHaveLength(0);
    });

    test('returns 2 contracts, when displayName is not passed', () => {
      const contractsResponse = tenderly.contracts.getBy();

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });

    test('returns 2 contracts, when both displayNames match', () => {
      const contractsResponse = tenderly.contracts.getBy({
        displayName: [beaconDepositContractDisplayName, bitDAOTreasuryContractDisplayName],
      });

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });
  });

  describe('network', () => {
    test('returns 2 contracts, when network matches', () => {
      const contractsResponse = tenderly.contracts.getBy({ network: Network.MAINNET });

      expect(contractsResponse).resolves.toHaveLength(1);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
        ]),
      );
    });

    test('returns 0 contracts, when network does not match', () => {
      const contractsResponse = tenderly.contracts.getBy({ network: Network.ROPSTEN });

      expect(contractsResponse).resolves.toHaveLength(0);
    });

    test('returns 2 contracts, when network is not passed', () => {
      const contractsResponse = tenderly.contracts.getBy();

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });

    test('returns 2 contracts, empty array is passed', () => {
      const contractsResponse = tenderly.contracts.getBy({
        network: [],
      });

      expect(contractsResponse).resolves.toHaveLength(2);
      expect(contractsResponse).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: beaconDepositContract,
            displayName: beaconDepositContractDisplayName,
            tags: beaconDepositContractTags,
          }),
          expect.objectContaining({
            address: bitDAOTreasuryContract,
            displayName: bitDAOTreasuryContractDisplayName,
            tags: bitDAOTreasuryContractTags,
          }),
        ]),
      );
    });
  });
});

test('Tenderly.with() overide works', () => {
  const newHandle = tenderly.with({ accountName: 'newAccountName' });
  expect(newHandle.configuration.accountName).toEqual('newAccountName');
});
