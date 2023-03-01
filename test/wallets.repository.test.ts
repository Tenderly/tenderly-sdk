import * as dotenv from 'dotenv';
import { Tenderly, Network } from '../lib';
import { Wallet } from '../lib/repositories/wallets/Wallet.model';

dotenv.config();

const WALLET_ADDRESS = '0xdbcb6db1ffeaa10cd157f985a8543261250efa46';
let tenderly: Tenderly = null;
let wallet: Wallet = null;

beforeAll(async () => {

  tenderly = new Tenderly(
    {
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

test('wallet.get works', async () => {
  const wallet = await tenderly.wallets.get(WALLET_ADDRESS);
  expect(wallet.address).toEqual(WALLET_ADDRESS);
});

