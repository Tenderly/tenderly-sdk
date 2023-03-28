import { Network, WalletResponse, VerifiedContractResponse } from '../lib';
import {
  filterByDisplayName,
  filterByNetwork,
  filterByTags,
} from '../lib/filters/contractsAndWallets';

const tag1 = 'tag1';
const tag2 = 'tag2';
const tag3 = 'tag3';

const contracts = [
  {
    contract: {
      address: '0x000',
      network_id: Network.MAINNET,
    },
    account_type: 'contract',
    display_name: 'Test1',
    tags: [{ tag: tag1 }, { tag: tag2 }],
  },
  {
    contract: {
      address: '0x001',
      network_id: Network.RINKEBY,
    },
    account_type: 'contract',
    display_name: 'Test2',
    tags: [{ tag: tag2 }],
  },
  {
    contract: {
      address: '0x002',
      network_id: Network.ROPSTEN,
    },
    account_type: 'contract',
    display_name: 'Test3',
    tags: [{ tag: tag2 }, { tag: tag3 }],
  },
  {
    contract: {
      address: '0x003',
      network_id: Network.MAINNET,
    },
    account_type: 'contract',
    tags: [{ tag: tag1 }, { tag: tag3 }],
  },
] as unknown as VerifiedContractResponse[];

const wallets = [
  {
    account: {
      address: '0x000',
      network_id: Network.MAINNET,
    },
    account_type: 'wallet',
    display_name: 'Test1',
    tags: [{ tag: tag1 }, { tag: tag2 }],
  },
  {
    account: {
      address: '0x001',
      network_id: Network.RINKEBY,
    },
    account_type: 'wallet',
    display_name: 'Test2',
    tags: [{ tag: tag2 }],
  },
  {
    account: {
      address: '0x002',
      network_id: Network.ROPSTEN,
    },
    account_type: 'wallet',
    display_name: 'Test3',
    tags: [{ tag: tag2 }, { tag: tag3 }],
  },
] as unknown as WalletResponse[];

describe('filterByDisplayName', () => {
  it('should filter by displayName', () => {
    const filtered = contracts.filter(contract => filterByDisplayName(contract, 'Test1'));
    expect(filtered.length).toBe(1);
    expect(filtered[0]).toBe(contracts[0]);
  });

  it('should filter by displayName array', () => {
    const filtered = contracts.filter(contract =>
      filterByDisplayName(contract, ['Test', 'Test2', 'Test3']),
    );
    expect(filtered.length).toBe(3);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[1]);
    expect(filtered[2]).toBe(contracts[2]);
  });

  it('should filter by displayName array with no matches', () => {
    const filtered = contracts.filter(contract =>
      filterByDisplayName(contract, ['Test5', 'Test6']),
    );
    expect(filtered.length).toBe(0);
  });

  it('should return all if no display name provided', () => {
    const filtered = contracts.filter(contract => filterByDisplayName(contract));
    expect(filtered.length).toBe(4);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[1]);
    expect(filtered[2]).toBe(contracts[2]);
    expect(filtered[3]).toBe(contracts[3]);
  });

  it('should return all that have display_name if display_name includes tested string', () => {
    const filtered = contracts.filter(contract => filterByDisplayName(contract, 'Te'));
    expect(filtered.length).toBe(3);
    filtered.forEach(contract => {
      expect(contract.display_name).toContain('Te');
    });
  });
});

describe('filterByTags', () => {
  it('should filter by tag', () => {
    const filtered = contracts.filter(contract => filterByTags(contract, tag1));
    expect(filtered.length).toBe(2);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[3]);
  });

  it('should filter by tag array', () => {
    const filtered = contracts.filter(contract => filterByTags(contract, [tag1, tag2, tag3]));
    expect(filtered.length).toBe(4);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[1]);
    expect(filtered[2]).toBe(contracts[2]);
    expect(filtered[3]).toBe(contracts[3]);
  });

  it('should filter by tag array with no matches', () => {
    const filtered = contracts.filter(contract => filterByTags(contract, ['tag5', 'tag6']));
    expect(filtered.length).toBe(0);
  });

  it('should return all if no tags provided', () => {
    const filtered = contracts.filter(contract => filterByTags(contract));
    expect(filtered.length).toBe(4);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[1]);
    expect(filtered[2]).toBe(contracts[2]);
    expect(filtered[3]).toBe(contracts[3]);
  });
});

describe('filterByNetwork', () => {
  it('should filter by network', () => {
    const filtered = contracts.filter(contract => filterByNetwork(contract, Network.MAINNET));
    expect(filtered.length).toBe(2);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[3]);
  });

  it('should filter by network array', () => {
    const filtered = contracts.filter(contract =>
      filterByNetwork(contract, [Network.MAINNET, Network.RINKEBY]),
    );
    expect(filtered.length).toBe(3);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[1]);
    expect(filtered[2]).toBe(contracts[3]);
  });

  it('should filter by network array with no matches', () => {
    const filtered = contracts.filter(contract => filterByNetwork(contract, [7, 8]));
    expect(filtered.length).toBe(0);
  });

  it('should return all if no network provided', () => {
    const filtered = contracts.filter(contract => filterByNetwork(contract));
    expect(filtered.length).toBe(4);
    expect(filtered[0]).toBe(contracts[0]);
    expect(filtered[1]).toBe(contracts[1]);
    expect(filtered[2]).toBe(contracts[2]);
    expect(filtered[3]).toBe(contracts[3]);
  });

  it('should filter wallets correctly if network is provided', () => {
    const filtered = wallets.filter(wallet => filterByNetwork(wallet, Network.MAINNET));
    expect(filtered.length).toBe(1);
    expect(filtered[0]).toBe(wallets[0]);
  });
});
