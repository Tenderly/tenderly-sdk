import { AxiosError } from 'axios';
import { Tenderly, Network } from '../lib';

const liquidityActivePoolWallet = '0xDf9Eb223bAFBE5c5271415C75aeCD68C21fE3D7F'.toLowerCase();
const canonicalTransactionChainWalletAddress =
  '0x5E4e65926BA27467555EB562121fac00D24E9dD2'.toLowerCase();
const polygonEtherBridgeWalletAddress = '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30'.toLowerCase();
const geminiContract1WalletAddress = '0x07Ee55aA48Bb72DcC6E9D78256648910De513eca'.toLowerCase();
const golemMultiSigWalletAddress = '0x7da82C7AB4771ff031b66538D2fB9b0B047f6CF9'.toLowerCase();
const kraken13WalletAddress = '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf'.toLowerCase();
const binance7WalletAddress = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'.toLowerCase();
const binance8WalletAddress = '0xF977814e90dA44bFA03b6295A0616a897441aceC'.toLowerCase();

let tenderly: Tenderly = null;
let getByTenderly: Tenderly = null;

beforeAll(async () => {
  tenderly = new Tenderly({
    accessKey: process.env.TENDERLY_ACCESS_KEY,
    accountName: process.env.TENDERLY_ACCOUNT_NAME,
    projectName: process.env.TENDERLY_PROJECT_NAME,
    network: Network.MAINNET,
  });

  getByTenderly = tenderly.with({
    projectName: process.env.TENDERLY_GET_BY_PROJECT_NAME,
  });

  await Promise.all([
    tenderly.wallets.add(liquidityActivePoolWallet),
    tenderly.wallets.add(canonicalTransactionChainWalletAddress),
    tenderly.wallets.add(golemMultiSigWalletAddress),
    getByTenderly.wallets.add(binance7WalletAddress),
    getByTenderly.wallets.add(binance8WalletAddress),
  ]);
});

afterAll(async () => {
  await Promise.all([
    tenderly.wallets.remove(liquidityActivePoolWallet),
    tenderly.wallets.remove(canonicalTransactionChainWalletAddress),
    tenderly.wallets.remove(polygonEtherBridgeWalletAddress),
    tenderly.wallets.remove(golemMultiSigWalletAddress),
    getByTenderly.wallets.remove(binance7WalletAddress),
    getByTenderly.wallets.remove(binance8WalletAddress),
  ]);
});

test('Tenderly has wallets namespace', () => {
  expect(tenderly.wallets).toBeDefined();
});

describe('wallets.add', () => {
  beforeEach(async () => {
    await tenderly.wallets.remove(polygonEtherBridgeWalletAddress);
  });

  test('successfully adds wallet', async () => {
    const wallet = await tenderly.wallets.add(polygonEtherBridgeWalletAddress);

    expect(wallet.address).toEqual(polygonEtherBridgeWalletAddress);
  });

  test('adding wallet data will successfully add with specified data', async () => {
    const wallet = await tenderly.wallets.add(polygonEtherBridgeWalletAddress, {
      displayName: 'VB3',
      tags: ['tag1', 'tag2'],
    });

    expect(wallet.address).toEqual(polygonEtherBridgeWalletAddress);
    expect(wallet.displayName).toEqual('VB3');
    // tags don't work yet
    // expect(wallet.tags.sort()).toEqual(['tag1', 'tag2']);
  });

  test('returns undefined if wallet exists', async () => {
    await tenderly.wallets.add(polygonEtherBridgeWalletAddress);
    const wallet = tenderly.wallets.add(polygonEtherBridgeWalletAddress);

    await expect(wallet).rejects.toThrowError(AxiosError);
    await wallet.catch(error => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data.error.slug).toEqual('already_added');
    });
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
    const walletResponse = await tenderly.wallets.get(golemMultiSigWalletAddress);

    expect(walletResponse.address).toEqual(golemMultiSigWalletAddress);
  });

  test("returns undefined value if wallet doesn't exist", async () => {
    const walletResponse = tenderly.wallets.get('0xfake_wallet_address');

    await expect(walletResponse).rejects.toThrowError(AxiosError);
    await walletResponse.catch(error => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data.error.slug).toEqual('non_existing_account');
    });
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

  test('updates tags and display name if both are passed', async () => {
    const wallet = await tenderly.wallets.update(kraken13WalletAddress, {
      displayName,
      appendTags: [tag1, tag2],
    });

    expect(wallet.address).toEqual(kraken13WalletAddress);
    expect(wallet.displayName).toEqual(displayName);
    expect(wallet.tags.sort()).toEqual([tag1, tag2]);
  });

  test('updates only displayName', async () => {
    const wallet = await tenderly.wallets.update(kraken13WalletAddress, {
      displayName,
    });

    expect(wallet.address).toEqual(kraken13WalletAddress);
    expect(wallet.displayName).toEqual(displayName);
    expect(wallet.tags).toBeUndefined();
  });

  test('updates only tags', async () => {
    const wallet = await tenderly.wallets.update(kraken13WalletAddress, {
      appendTags: [tag1, tag2],
    });

    expect(wallet.address).toEqual(kraken13WalletAddress);
    expect(wallet.displayName).toBeUndefined();
    expect(wallet.tags.sort()).toEqual(expect.arrayContaining([tag1, tag2]));
  });
});

describe('wallets.getBy', () => {
  const binance7WalletDisplayName = 'Binance7';
  const binance8WalletDisplayName = 'Binance8';
  const tag1 = 'Tag1';
  const tag2 = 'Tag2';
  const tag3 = 'Tag3';
  const binance7WalletTags = [tag1, tag2];
  const binance8WalletTags = [tag2, tag3];

  beforeAll(async () => {
    await Promise.all([
      getByTenderly.wallets.update(binance7WalletAddress, {
        displayName: binance7WalletDisplayName,
        appendTags: binance7WalletTags,
      }),
      getByTenderly.wallets.update(binance8WalletAddress, {
        displayName: binance8WalletDisplayName,
        appendTags: binance8WalletTags,
      }),
    ]);
  });

  describe('tags', () => {
    test('returns 1 wallet, when 1 tag matches (passed as 1 string, not an array)', async () => {
      const wallets = await getByTenderly.wallets.getBy({ tags: [tag1] });

      expect(wallets).toHaveLength(1);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
    });

    test('returns 0 wallets, when no tags match', async () => {
      const wallets = await getByTenderly.wallets.getBy({ tags: ['Tag4'] });

      expect(wallets).toHaveLength(0);
    });

    test('returns 1 wallet, when `tag1` matches', async () => {
      const wallets = await getByTenderly.wallets.getBy({ tags: [tag1] });

      expect(wallets).toHaveLength(1);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
    });

    test('returns 2 wallets, when `tag2` matches', async () => {
      const wallets = (await getByTenderly.wallets.getBy({ tags: [tag2] })).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });

    test('returns 1 wallet, when `tag3` matches', async () => {
      const wallets = await getByTenderly.wallets.getBy({ tags: [tag3] });

      expect(wallets).toHaveLength(1);
      expect(wallets[0].address).toEqual(binance8WalletAddress);
      expect(wallets[0].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance8WalletTags.sort());
    });

    test('returns 2 wallets, when any of 3 tags match', async () => {
      const wallets = (await getByTenderly.wallets.getBy({ tags: [tag1, tag2, tag3] })).sort(
        (a, b) => (a.address > b.address ? 1 : -1),
      );

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });

    test("returns 2 wallets, when both tags that don't overlap are passed", async () => {
      const wallets = (await getByTenderly.wallets.getBy({ tags: [tag1, tag3] })).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });

    test('returns 2 wallets, when no tags are passed', async () => {
      const wallets = (await getByTenderly.wallets.getBy()).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });

    test('returns 2 wallets, when empty array is passed', async () => {
      const wallets = (await getByTenderly.wallets.getBy({ tags: [] })).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });
  });

  describe('displayName', () => {
    test('returns 1 wallet, when displayName matches', async () => {
      const wallets = await getByTenderly.wallets.getBy({
        displayNames: [binance7WalletDisplayName],
      });

      expect(wallets).toHaveLength(1);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
    });

    test('returns 0 wallets, when displayName does not match', async () => {
      const wallets = await getByTenderly.wallets.getBy({
        displayNames: ['non existing display name'],
      });

      expect(wallets).toHaveLength(0);
    });

    test('returns 2 contracts, when displayName is not passed', async () => {
      const wallets = (await getByTenderly.wallets.getBy()).sort((a, b) =>
        a.address > b.address ? 1 : -1,
      );

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });

    test('returns 2 contracts, when both displayNames match', async () => {
      const wallets = (
        await getByTenderly.wallets.getBy({
          displayNames: [binance7WalletDisplayName, binance8WalletDisplayName],
        })
      ).sort((a, b) => (a.address > b.address ? 1 : -1));

      expect(wallets).toHaveLength(2);
      expect(wallets[0].address).toEqual(binance7WalletAddress);
      expect(wallets[0].displayName).toEqual(binance7WalletDisplayName);
      expect(wallets[0].tags.sort()).toEqual(binance7WalletTags.sort());
      expect(wallets[1].address).toEqual(binance8WalletAddress);
      expect(wallets[1].displayName).toEqual(binance8WalletDisplayName);
      expect(wallets[1].tags.sort()).toEqual(binance8WalletTags.sort());
    });
  });
});
