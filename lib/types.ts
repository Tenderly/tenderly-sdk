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
  ZORA_GOERLI = 999,
  MOONBEAM = 1284,
  MOONRIVER = 1285,
  BOBA_MOONBEAM = 1294,
  BOBA_MOONBASE = 1297,
  HOLESKY = 17000,
  BOBA_GOERLI = 2888,
  FANTOM_TESTNET = 4002,
  BOBA_AVALANCHE_FUJI = 4328,
  MANTLE = 5000,
  BASE = 8453,
  BOBA_BINANCE_RIALTO = 9728,
  ARBITRUM_ONE = 42161,
  ARBITRUM_NOVA = 42170,
  AVALANCHE_FUJI = 43113,
  AVALANCHE = 43114,
  BOBA_AVALANCHE = 43288,
  BOBA_BINANCE = 56288,
  LINEA_GOERLI = 59140,
  LINEA = 59144,
  POLYGON_MUMBAI = 80001,
  BASE_GOERLI = 84531,
  BASE_SEPOLIA = 84532,
  ARBITRUM_GOERLI = 421613,
  ARBITRUM_SEPOLIA = 421614,
  ZORA = 7777777,
  SEPOLIA = 11155111,
  OPTIMISTIC_SEPOLIA = 11155420,
  ZORA_SEPOLIA = 999999999,
}

export type TenderlyConfiguration = {
  accountName: string;
  projectName: string;
  accessKey: string;
  network: Network | number;
};

// helper types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type EmptyObject = Record<PropertyKey, never>;
