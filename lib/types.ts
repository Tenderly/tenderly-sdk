export type Path = string;
export type Web3Address = string;

export enum Network {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  ARBITRUM_NOVA = 42170,
  ARBITRUM_SEPOLIA = 421614,
  AVALANCHE = 43114,
  AVALANCHE_FUJI = 43113,
  BASE = 8453,
  BASE_SEPOLIA = 84532,
  BLAST = 81457,
  BINANCE = 56,
  RIALTO_BINANCE = 97,
  BOBA_ETHEREUM = 288,
  BOBA_GOERLI = 2888,
  BOBA_SEPOLIA = 28882,
  BOBA_BINANCE = 56288,
  BOBA_BINANCE_RIALTO = 9728,
  FANTOM = 250,
  FANTOM_TESTNET = 4002,
  FRAXTAL = 252,
  FRAXTAL_HOLESKY = 2522,
  GNOSIS_CHAIN = 100,
  GOERLI = 5,
  HOLESKY = 17000,
  LINEA = 59144,
  LINEA_GOERLI = 59140,
  LINEA_SEPOLIA = 59141,
  MAINNET = 1,
  MANTLE = 5000,
  MANTLE_SEPOLIA = 5003,
  MOONBEAM = 1284,
  MOONRIVER = 1285,
  OPTIMISTIC = 10,
  OPTIMISTIC_GOERLI = 420,
  OPTIMISTIC_SEPOLIA = 11155420,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  REAL = 111188,
  RSK = 30,
  RSK_TESTNET = 31,
  SEPOLIA = 11155111,
  UNREAL = 18233,
  ZORA = 7777777,
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
