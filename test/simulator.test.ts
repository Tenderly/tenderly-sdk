import * as dotenv from 'dotenv';
import { Network, Tenderly } from '../lib';

dotenv.config();

let tenderly: Tenderly = null;

const counterContract = '0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057';
const nullAddress = '0x0000000000000000000000000000000000000000';

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.RINKEBY,
  });

  await tenderly.contracts.add(counterContract);
});

test('simulateTransaction works', async () => {
  const r = await tenderly.simulator.simulateTransaction({
    transaction: {
      from: nullAddress,
      to: counterContract,
      input: '0x371303c0',
    },
    blockNumber: 12354651,
    override: {
      "0x2e4534ad99d5e7fffc9bbe52df69ba8febeb0057": {
        "storage": {
          "0x0000000000000000000000000000000000000000000000000000000000000000":
            "0x0000000000000000000000000000000000000000000000000000000000000009"
        }
      }
    }
  });

  expect(r.timestamp).toBeDefined();
});

afterAll(async () => {
  await tenderly.contracts.remove(counterContract);
});