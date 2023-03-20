import { Network, ContractResponse } from '../lib';
import { filterEntities } from '../lib/filters';
import { contractsOrWalletsFilterMap } from '../lib/filters/contractsAndWallets';

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
] as unknown as ContractResponse[];

describe('filters by display name', () => {
  it('should filter by single display name', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: 'Test1' },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0]]);
  });

  it('should filter by multiple display names', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: ['Test1', 'Test2'] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[1]]);
  });

  it('should return all contracts if no display name is provided', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: '' },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual(contracts);
  });

  it('should return all contracts if empty array is provided', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: [] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual(contracts);
  });
});

describe('filters by tag', () => {
  it('should filter by single tag', () => {
    const filteredContracts = filterEntities(
      contracts,
      { tags: tag1 },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[3]]);
  });

  it('should filter by multiple tags', () => {
    const filteredContracts = filterEntities(
      contracts,
      { tags: [tag1, tag3] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[2], contracts[3]]);
  });
});

describe('filters by network', () => {
  it('should filter by single network', () => {
    const filteredContracts = filterEntities(
      contracts,
      { network: Network.MAINNET },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[3]]);
  });

  it('should filter by multiple networks', () => {
    const filteredContracts = filterEntities(
      contracts,
      { network: [Network.MAINNET, Network.RINKEBY] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[1], contracts[3]]);
  });
});

describe('filters by display name and tag', () => {
  it('should filter by single display name and single tag', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: 'Test1', tags: tag1 },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0]]);
  });

  it('should filter by multiple display names and multiple tags', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: ['Test1', 'Test2'], tags: [tag1, tag3] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0]]);
  });
});

describe('filters by display name and network', () => {
  it('should filter by single display name and single network', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: 'Test1', network: Network.MAINNET },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0]]);
  });

  it('should filter by multiple display names and multiple networks', () => {
    const filteredContracts = filterEntities(
      contracts,
      { displayName: ['Test1', 'Test2'], network: [Network.MAINNET, Network.RINKEBY] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[1]]);
  });
});

describe('filters by tag and network', () => {
  it('should filter by single tag and single network', () => {
    const filteredContracts = filterEntities(
      contracts,
      { tags: tag1, network: Network.MAINNET },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[3]]);
  });

  it('should filter by multiple tags and multiple networks', () => {
    const filteredContracts = filterEntities(
      contracts,
      { tags: [tag1, tag3], network: [Network.MAINNET, Network.RINKEBY] },
      contractsOrWalletsFilterMap,
    );

    expect(filteredContracts).toEqual([contracts[0], contracts[3]]);
  });
});

test('returns all contracts if no filters are provided', () => {
  const filteredContracts = filterEntities(contracts, {}, contractsOrWalletsFilterMap);

  expect(filteredContracts).toEqual(contracts);
});
