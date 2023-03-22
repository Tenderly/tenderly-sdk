export type Path = string;
export type Web3Address = string;

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  SEPOLIA = 11155111,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
}

export type TenderlyConfiguration = {
  accountName: string;
  projectName: string;
  accessKey: string;
  network: Network;
};

// helper types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
