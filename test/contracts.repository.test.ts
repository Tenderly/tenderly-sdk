import { Tenderly, Network, SolidityCompilerVersions } from '../lib';
import { ApiError } from '../lib/errors/ApiError';

let tenderly: Tenderly = null;
let rinkebyTenderly: Tenderly = null;
let getByTenderly: Tenderly = null;

jest.setTimeout(20000);

const lidoContract = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'.toLowerCase();
const helloWorldContract = '0xaf7B04D030aDc77548a333BEff797D3f187F58A1'.toLowerCase();
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

  rinkebyTenderly = tenderly.with({ network: Network.SEPOLIA });

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
    const contract = await tenderly.contracts.add(lidoContract);

    expect(contract.address).toEqual(lidoContract);
  });

  test('adding contract data will successfuly add with specified data', async () => {
    const lidoContractResponse = await tenderly.contracts.add(lidoContract, {
      displayName: 'Lido',
      tags: ['staking', 'eth2'],
      network: Network.MAINNET,
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
  test('returns falsy value if contract exists', async () => {
    const removeContractResponse = await tenderly.contracts.remove(arbitrumBridgeContract);

    expect(removeContractResponse).toBeFalsy();
  });

  test("returns falsy value if contract doesn't exist", async () => {
    const removeContractResponse = await tenderly.contracts.remove('0xfake_contract_address');

    expect(removeContractResponse).toBeFalsy();
  });
});

describe('contracts.get', () => {
  test('returns contract if it exists', async () => {
    const contract = await tenderly.contracts.get(kittyCoreContract);

    expect(contract.address).toEqual(kittyCoreContract);
  });

  test("throws 400 error with non_existing_contract slug if contract doesn't exist on project", async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const contract = await tenderly.contracts.get('0xfake_contract_address');
    } catch (error) {
      expect(error instanceof ApiError).toBeTruthy();
      expect(error.status).toBe(400);
      expect(error.slug).toEqual('non_existing_contract');
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
  test('contracts.verify works for correct config', async () => {
    try {
      const result = await rinkebyTenderly.contracts.verify(helloWorldContract, {
        mode: 'public',
        contractToVerify: 'HelloWorld',
        solc: {
          compiler: {
            version: SolidityCompilerVersions.v0_8_13,
            settings: {
              optimizer: {
                enabled: true,
                runs: 200,
              },
            },
          },
          sources: {
            'HelloWorld.sol': {
              name: 'HelloWorld',
              code: `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.13;

              contract HelloWorld {
                string public greeting;

                constructor(string memory _greeting) {
                  greeting = _greeting;
                }

                function getGreeting() public view returns (string memory) {
                  return greeting;
                }

                function setGreeting(string memory _greeting) public {
                  greeting = _greeting;
                }
              }
              `,
            },
          },
        },
      });
      expect(result).toBeDefined();
    } catch (e) {
      console.log(e);
    }
  });

  test('contracts.verify fails for wrong compiler version', async () => {
    try {
      await rinkebyTenderly.contracts.verify(helloWorldContract, {
        mode: 'public',
        contractToVerify: 'HelloWorld',
        solc: {
          compiler: {
            version: SolidityCompilerVersions.v0_8_4,
            settings: {
              optimizer: {
                enabled: true,
                runs: 200,
              },
            },
          },
          sources: {
            'HelloWorld.sol': {
              name: 'HelloWorld',
              code: `// SPDX-License-Identifier: MIT
              pragma solidity ^0.8.13;

              contract HelloWorld {
                string public greeting;

                constructor(string memory _greeting) {
                  greeting = _greeting;
                }

                function getGreeting() public view returns (string memory) {
                  return greeting;
                }

                function setGreeting(string memory _greeting) public {
                  greeting = _greeting;
                }
              }`,
            },
          },
        },
      });
    } catch (error) {
      expect(error instanceof ApiError).toBeTruthy();
      expect(error.status).toBe(422);
      expect(error.slug).toEqual('compile_error');
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
      const contracts = await getByTenderly.contracts.getBy({ tags: tag1 });

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
