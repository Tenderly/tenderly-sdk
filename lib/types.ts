export type Path = string;
export type Web3Address = string;

export enum Network {
  MAINNET = 1,
  GOERLI = 5,
  OPTIMISTIC = 10,
  CRONOS = 25,
  RSK = 30,
  RSK_TESTNET = 31,
  KOVAN = 42,
  BINANCE = 56,
  OPTIMISTIC_KOVAN = 69,
  RIALTO_BINANCE = 97,
  POA = 99,
  GNOSIS_CHAIN = 100,
  POLYGON = 137,
  FANTOM = 250,
  BOBA_ETHEREUM = 288,
  CRONOS_TESTNET = 338,
  OPTIMISTIC_GOERLI = 420,
  MOONBEAM = 1284,
  MOONRIVER = 1285,
  BOBA_MOONBEAM = 1294,
  BOBA_MOONBASE = 1297,
  BOBA_GOERLI = 2888,
  FANTOM_TESTNET = 4002,
  BOBA_AVALANCHE_FUJI = 4328,
  BASE = 8453,
  BOBA_BINANCE_RIALTO = 9728,
  ARBITRUM_ONE = 42161,
  AVALANCHE_FUJI = 43113,
  AVALANCHE = 43114,
  BOBA_AVALANCHE = 43288,
  BOBA_BINANCE = 56288,
  POLYGON_MUMBAI = 80001,
  BASE_GOERLI = 84531,
  ARBITRUM_GOERLI = 421613,
  SEPOLIA = 11155111,
}

export type TenderlyConfiguration = {
  accountName: string;
  projectName: string;
  accessKey: string;
  network: Network | number;
};

// helper types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
