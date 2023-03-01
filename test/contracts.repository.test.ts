import * as dotenv from 'dotenv';
import { Tenderly, Network } from '../lib';

dotenv.config();

let tenderly: Tenderly = null;

beforeAll(() => {

  tenderly = new Tenderly(
    {
      accessKey: process.env.TENDERLY_ACCESS_KEY,
      accountName: process.env.TENDERLY_ACCOUNT_NAME,
      projectName: process.env.TENDERLY_PROJECT_NAME,
      network: Network.MAINNET,
    });
});

test('Tenderly has contracts namespace', () => {
  expect(tenderly.contracts).toBeDefined();
});

test('contract.get works', async () => {
  const contract = await tenderly.contracts.get('0x06012c8cf97bead5deae237070f9587f8e7a266d');
  expect(contract.address).toEqual('0x06012c8cf97bead5deae237070f9587f8e7a266d');
});

test('contract.add works', async () => {
  const contract = await tenderly.contracts.add('0x5e4e65926ba27467555eb562121fac00d24e9dd2',);
  expect(contract.address).toEqual('0x5e4e65926ba27467555eb562121fac00d24e9dd2');
});

test('Tenderly.with() overide works', () => {
  const newHandle = tenderly.with({ accountName: 'newAccountName' });
  expect(newHandle.configuration.accountName).toEqual('newAccountName');
});
