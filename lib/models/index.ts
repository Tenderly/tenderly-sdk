export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
}

export type TenderlyConfiguration = {
  accountName: string;
  projectName: string;
  accessKey: string;
  network: Network;
}

export type TransactionParameters = {
  from: string;
  to: string;
  input: string;
}
