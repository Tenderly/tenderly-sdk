import * as dotenv from 'dotenv';
import { Tenderly, Network } from '../lib';
import { Wallet } from '../lib/repositories/wallets/Wallet.model';

dotenv.config();

const WALLET_ADDRESS = '0xdbcb6db1ffeaa10cd157f985a8543261250efa46';
let tenderly: Tenderly = null;
let wallet: Wallet = null;

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  wallet = await tenderly.wallets.add(WALLET_ADDRESS, { displayName: 'TEST_WALLET' });
});

afterAll(async () => {
  await tenderly.wallets.remove(wallet.address);
});

test('Tenderly has wallets namespace', () => {
  expect(tenderly.wallets).toBeDefined();
});

test('wallets.get works', async () => {
  const wallet = await tenderly.wallets.get(WALLET_ADDRESS);
  expect(wallet.address).toEqual(WALLET_ADDRESS);
});

describe('wallets.add', () => {
  beforeAll(async () => {
    await tenderly.wallets.remove(WALLET_ADDRESS);
  });

  afterAll(async () => {
    await tenderly.wallets.remove(WALLET_ADDRESS);
  });

  test('wallets.add works', async () => {
    const wallet = await tenderly.wallets.add(WALLET_ADDRESS);
    expect(wallet.address).toEqual(WALLET_ADDRESS);
  });
});

describe('wallets.remove', () => {
  beforeAll(async () => {
    await tenderly.wallets.add(WALLET_ADDRESS);
  });

  test('wallets.remove works', async () => {
    const removeWalletResponse = tenderly.wallets.remove(WALLET_ADDRESS);
    await expect(removeWalletResponse).resolves.toBeFalsy();
  });
});

describe('wallets.update', () => {
  beforeEach(async () => {
    await tenderly.wallets.add(WALLET_ADDRESS);
  });

  afterEach(async () => {
    await tenderly.wallets.remove(WALLET_ADDRESS);
  });

  test('doesn\t throw an error when called correctly', async () => {
    const updateWalletResponse = tenderly.wallets.update(WALLET_ADDRESS, {
      displayName: 'TEST_WALLET',
      appendTags: ['TEST_TAG'],
    });

    await expect(updateWalletResponse).resolves.toBeDefined();
  });

  test('updates only displayName', async () => {
    const updateWalletResponse = tenderly.wallets.update(WALLET_ADDRESS, {
      displayName: 'TEST_WALLET',
    });

    await expect(updateWalletResponse).resolves.toBeDefined();
    const updatedWallet = await updateWalletResponse;
    expect(updatedWallet.displayName).toEqual('TEST_WALLET');
    expect(updatedWallet.tags).toBeUndefined();
  });

  test('updates only tags', async () => {
    const updateWalletResponse = tenderly.wallets.update(WALLET_ADDRESS, {
      appendTags: ['TEST_TAG'],
    });

    await expect(updateWalletResponse).resolves.toBeDefined();
    const updatedWallet = await updateWalletResponse;
    expect(updatedWallet.displayName).toBeUndefined();
    expect(updatedWallet.tags).toEqual(['TEST_TAG']);
  });
});
