import * as dotenv from 'dotenv';
import { Tenderly, Network } from '../lib';

dotenv.config();

let tenderly: Tenderly = null;

const canonicalTransactionChainContractAddress = '0x5e4e65926ba27467555eb562121fac00d24e9dd2';
const kittyCoreContract = '0x06012c8cf97bead5deae237070f9587f8e7a266d';

beforeAll(() => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

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

test('Tenderly.with() overide works', () => {
  const newHandle = tenderly.with({ accountName: 'newAccountName' });
  expect(newHandle.configuration.accountName).toEqual('newAccountName');
});
