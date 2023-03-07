import * as dotenv from 'dotenv';
import { Tenderly, Network } from '../lib';

dotenv.config();

const lidoWallet = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'.toLowerCase();
const kittyCoreWallet = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'.toLowerCase();
const wrappedEtherWallet = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
const beaconDepositWallet = '0x00000000219ab540356cBB839Cbe05303d7705Fa'.toLowerCase();
const arbitrumBridgeWallet = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a'.toLowerCase();
const bitDAOTreasuryWallet = '0x78605Df79524164911C144801f41e9811B7DB73D'.toLowerCase();
const liquityActivePoolWallet = '0xDf9Eb223bAFBE5c5271415C75aeCD68C21fE3D7F'.toLowerCase();
const canonicalTransactionChainWalletAddress =
  '0x5E4e65926BA27467555EB562121fac00D24E9dD2'.toLowerCase();

let tenderly: Tenderly = null;

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  await Promise.all([
    tenderly.wallets.add(kittyCoreWallet),
    tenderly.wallets.add(wrappedEtherWallet),
    tenderly.wallets.add(beaconDepositWallet),
    tenderly.wallets.add(bitDAOTreasuryWallet),
    tenderly.wallets.add(arbitrumBridgeWallet),
    tenderly.wallets.add(liquityActivePoolWallet),
    tenderly.wallets.add(canonicalTransactionChainWalletAddress),
  ]);
});

afterAll(async () => {
  await Promise.all([
    tenderly.wallets.remove(lidoWallet),
    tenderly.wallets.remove(kittyCoreWallet),
    tenderly.wallets.remove(wrappedEtherWallet),
    tenderly.wallets.remove(beaconDepositWallet),
    tenderly.wallets.remove(bitDAOTreasuryWallet),
    tenderly.wallets.remove(arbitrumBridgeWallet),
    tenderly.wallets.remove(liquityActivePoolWallet),
    tenderly.wallets.remove(canonicalTransactionChainWalletAddress),
  ]);
});

test('Tenderly has wallets namespace', () => {
  expect(tenderly.wallets).toBeDefined();
});

describe('wallets.add', () => {
  test('succesfuly adds contract', async () => {
    const walletResponse = tenderly.wallets.add(lidoWallet);

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: lidoWallet,
      }),
    );
  });

  test('returns undefined if wallet exists', async () => {
    await tenderly.wallets.add(lidoWallet);
    const walletResponse = tenderly.wallets.add(lidoWallet);

    await expect(walletResponse).resolves.toBeUndefined();
  });
});

describe('wallets.remove', () => {
  test('returns falsy value if wallet does exist', async () => {
    const removeWalletResponse = tenderly.wallets.remove(arbitrumBridgeWallet);

    await expect(removeWalletResponse).resolves.toBeFalsy();
  });

  test("returns falsy value if wallet doesn't exist", async () => {
    const removeWalletResponse = tenderly.wallets.remove('0xfake_wallet_address');

    await expect(removeWalletResponse).resolves.toBeFalsy();
  });
});

describe('wallets.get', () => {
  test('returns wallet if it exists', async () => {
    const walletResponse = tenderly.wallets.get(wrappedEtherWallet);

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherWallet,
      }),
    );
  });

  test("returns undefined value if wallet doesn't exist", async () => {
    const walletResponse = tenderly.wallets.get('0xfake_wallet_address');

    await expect(walletResponse).resolves.toBeFalsy();
  });
});

describe('wallets.update', () => {
  beforeEach(async () => {
    await tenderly.wallets.add(wrappedEtherWallet);
  });

  afterEach(async () => {
    await tenderly.wallets.remove(wrappedEtherWallet);
  });

  test("doesn't throw an error when called correctly", async () => {
    const updateWalletResponse = tenderly.wallets.update(wrappedEtherWallet, {
      displayName: 'NewDisplayName',
      appendTags: ['NewTag', 'NewTag2'],
    });

    await expect(updateWalletResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherWallet,
        displayName: 'NewDisplayName',
        tags: expect.arrayContaining(['NewTag', 'NewTag2']),
      }),
    );
  });

  test('updates only displayName', async () => {
    const walletResponse = tenderly.wallets.update(wrappedEtherWallet, {
      displayName: 'NewDisplayName',
    });

    await expect(walletResponse).resolves.toBeDefined();
    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherWallet,
        displayName: 'NewDisplayName',
      }),
    );
  });

  test('updates only tags', async () => {
    const walletResponse = tenderly.wallets.update(wrappedEtherWallet, {
      appendTags: ['NewTag', 'NewTag2'],
    });

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: wrappedEtherWallet,
        tags: expect.arrayContaining(['NewTag', 'NewTag2']),
      }),
    );
    // expect display name to be 'NewDisplayName' or not defined
    await expect(walletResponse).resolves.not.toBe(
      expect.objectContaining({
        displayName: expect.anything(),
      }),
    );
  });
});
