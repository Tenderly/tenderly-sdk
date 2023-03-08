import * as dotenv from 'dotenv';
import { Tenderly, Network } from '../lib';

dotenv.config();

const liquityActivePoolWallet = '0xDf9Eb223bAFBE5c5271415C75aeCD68C21fE3D7F'.toLowerCase();
const canonicalTransactionChainWalletAddress =
  '0x5E4e65926BA27467555EB562121fac00D24E9dD2'.toLowerCase();
const polygonEtherBridgeWalletAddress = '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30'.toLowerCase();
const vb3WalletAddress = '0x220866B1A2219f40e72f5c628B65D54268cA3A9D'.toLowerCase();
const geminiContract1WalletAddress = '0x07Ee55aA48Bb72DcC6E9D78256648910De513eca'.toLowerCase();
const golemMultiSigWalletAddress = '0x7da82C7AB4771ff031b66538D2fB9b0B047f6CF9'.toLowerCase();
const kraken13WalletAddress = '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf'.toLowerCase();

let tenderly: Tenderly = null;

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  await Promise.all([
    tenderly.wallets.add(liquityActivePoolWallet),
    tenderly.wallets.add(canonicalTransactionChainWalletAddress),
    tenderly.wallets.add(vb3WalletAddress),
    tenderly.wallets.add(golemMultiSigWalletAddress),
  ]);
});

afterAll(async () => {
  await Promise.all([
    tenderly.wallets.remove(liquityActivePoolWallet),
    tenderly.wallets.remove(canonicalTransactionChainWalletAddress),
    tenderly.wallets.remove(polygonEtherBridgeWalletAddress),
    tenderly.wallets.remove(vb3WalletAddress),
    tenderly.wallets.remove(golemMultiSigWalletAddress),
  ]);
});

test('Tenderly has wallets namespace', () => {
  expect(tenderly.wallets).toBeDefined();
});

describe('wallets.add', () => {
  beforeEach(async () => {
    await tenderly.wallets.remove(polygonEtherBridgeWalletAddress);
  });

  test('succesfuly adds wallet', async () => {
    const walletResponse = tenderly.wallets.add(polygonEtherBridgeWalletAddress);

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: polygonEtherBridgeWalletAddress,
      }),
    );
  });

  test('adding wallet data will successfuly update wallet', async () => {
    const walletResponse = tenderly.wallets.add(vb3WalletAddress, {
      displayName: 'VB3',
      tags: ['tag1', 'tag2'],
    });

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: vb3WalletAddress,
        displayName: 'VB3',
        tags: ['tag1', 'tag2'],
      }),
    );
  });

  test('returns undefined if wallet exists', async () => {
    await tenderly.wallets.add(polygonEtherBridgeWalletAddress);
    const walletResponse = tenderly.wallets.add(polygonEtherBridgeWalletAddress);

    await expect(walletResponse).resolves.toBeUndefined();
  });
});

describe('wallets.remove', () => {
  test('returns falsy value if wallet does exist', async () => {
    const removeWalletResponse = tenderly.wallets.remove(geminiContract1WalletAddress);

    await expect(removeWalletResponse).resolves.toBeFalsy();
  });

  test("returns falsy value if wallet doesn't exist", async () => {
    const removeWalletResponse = tenderly.wallets.remove('0xfake_wallet_address');

    await expect(removeWalletResponse).resolves.toBeFalsy();
  });
});

describe('wallets.get', () => {
  test('returns wallet if it exists', async () => {
    const walletResponse = tenderly.wallets.get(golemMultiSigWalletAddress);

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: golemMultiSigWalletAddress,
      }),
    );
  });

  test("returns undefined value if wallet doesn't exist", async () => {
    const walletResponse = tenderly.wallets.get('0xfake_wallet_address');

    await expect(walletResponse).resolves.toBeFalsy();
  });
});

describe('wallets.update', () => {
  const tag1 = 'Tag1';
  const tag2 = 'Tag2';
  const displayName = 'DisplayName';

  beforeEach(async () => {
    await tenderly.wallets.add(kraken13WalletAddress);
  });

  afterEach(async () => {
    await tenderly.wallets.remove(kraken13WalletAddress);
  });

  test("doesn't throw an error when called correctly", async () => {
    const updateWalletResponse = tenderly.wallets.update(kraken13WalletAddress, {
      displayName,
      appendTags: [tag1, tag2],
    });

    await expect(updateWalletResponse).resolves.toEqual(
      expect.objectContaining({
        address: kraken13WalletAddress,
        displayName,
        tags: expect.arrayContaining([tag1]),
      }),
    );
  });

  test('updates only displayName', async () => {
    const walletResponse = tenderly.wallets.update(kraken13WalletAddress, {
      displayName,
    });

    await expect(walletResponse).resolves.toBeDefined();
    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: kraken13WalletAddress,
        displayName,
      }),
    );
  });

  test('updates only tags', async () => {
    const walletResponse = tenderly.wallets.update(kraken13WalletAddress, {
      appendTags: [tag1, tag2],
    });

    await expect(walletResponse).resolves.toEqual(
      expect.objectContaining({
        address: kraken13WalletAddress,
        tags: expect.arrayContaining([tag1, tag2]),
      }),
    );
    await expect(walletResponse).resolves.not.toBe(
      expect.objectContaining({
        displayName: expect.anything(),
      }),
    );
  });
});
