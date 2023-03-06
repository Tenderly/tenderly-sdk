import { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { Tenderly, Network, SolidityCompilerVersions } from '../lib';

dotenv.config();

let tenderly: Tenderly = null;
let rinkebyTenderly: Tenderly = null;

const canonicalTransactionChainContractAddress = '0x5e4e65926ba27467555eb562121fac00d24e9dd2';
const counterContract = '0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057';
const kittyCoreContract = '0x06012c8cf97bead5deae237070f9587f8e7a266d';

beforeAll(() => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  rinkebyTenderly = tenderly.with({ network: Network.RINKEBY });

  return Promise.allSettled([
    tenderly.contracts.remove(canonicalTransactionChainContractAddress),
    tenderly.contracts.remove(kittyCoreContract),
  ]);
});

test('Tenderly has contracts namespace', () => {
  expect(tenderly.contracts).toBeDefined();
});

test('contracts.get works', async () => {
  const contractResponse = tenderly.contracts.get(kittyCoreContract);
  await expect(contractResponse).resolves.toBeDefined();
  const contract = await contractResponse;
  expect(contract.address).toEqual(kittyCoreContract);
});

describe('contracts.add', () => {
  beforeAll(async () => {
    await tenderly.contracts.remove(canonicalTransactionChainContractAddress);
  });

  afterAll(async () => {
    await tenderly.contracts.remove(canonicalTransactionChainContractAddress);
  });

  test('contracts.add works', async () => {
    const contract = await tenderly.contracts.add(canonicalTransactionChainContractAddress);
    expect(contract.address).toEqual(canonicalTransactionChainContractAddress);
  });
});

describe('contracts.remove', () => {
  beforeAll(async () => {
    await tenderly.contracts.add(canonicalTransactionChainContractAddress);
  });

  test('contracts.remove works', async () => {
    const removeContractResponse = tenderly.contracts.remove(
      canonicalTransactionChainContractAddress,
    );
    await expect(removeContractResponse).resolves.toBeFalsy();
  });

  test("doesn't throw an error when contract does not exist", async () => {
    const removeContractResponse = tenderly.contracts.remove('0xfake_contract_address');
    await expect(removeContractResponse).resolves.toBeFalsy();
  });
});

describe('contracts.update', () => {
  beforeEach(async () => {
    await tenderly.contracts.add(kittyCoreContract);
  });

  afterEach(async () => {
    await tenderly.contracts.remove(kittyCoreContract);
  });

  test("doesn't throw an error when called correctly", async () => {
    const updateContractResponse = tenderly.contracts.update(kittyCoreContract, {
      displayName: 'NewDisplayName',
      appendTags: ['NewTag', 'NewTag2'],
    });

    await expect(updateContractResponse).resolves.toBeDefined();
  });

  test('updates only displayName', async () => {
    const contractResponse = await tenderly.contracts.update(kittyCoreContract, {
      displayName: 'NewDisplayName',
    });
    expect(contractResponse.displayName).toEqual('NewDisplayName');
    expect(contractResponse.tags).toBeUndefined();
  });

  test('updates only tags', async () => {
    const contractResponse = await tenderly.contracts.update(kittyCoreContract, {
      appendTags: ['NewTag', 'NewTag2'],
    });
    expect(contractResponse.tags).toContain('NewTag');
    expect(contractResponse.tags).toContain('NewTag2');
    expect(contractResponse.displayName).toBeUndefined();
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
            }
          }
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
            `
          }
        }
      }
    });

    expect(result).toBeDefined();
  });

  test('contracts.verify fails for wrong compiler version', async () => {
    expect(async () => await rinkebyTenderly.contracts.verify(counterContract, {
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
            }
          }
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
            `
          }
        }
      }
    })).rejects.toThrow(AxiosError);
  });
});

test('Tenderly.with() overide works', () => {
  const newHandle = tenderly.with({ accountName: 'newAccountName' });
  expect(newHandle.configuration.accountName).toEqual('newAccountName');
});
