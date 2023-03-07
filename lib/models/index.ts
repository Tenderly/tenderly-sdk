export enum SolidityCompilerVersions {
  v0_8_4 = "v0.8.4",
  v0_8_13 = "v0.8.13",
  v0_8_17 = "v0.8.17",

}

export type Path = string;
export type Web3Address = string;

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

export type VerificationRequest = {
  solc: {
    compiler: {
      version: SolidityCompilerVersions,
      settings: {
        optimizer: {
          enabled: boolean,
          runs: number,
        },
        libraries: Record<Path, Record<string, Web3Address>>
      },
    },
    sources: Record<Path, { name: string, source: string }>
  },
  config: {
    mode: "private" | "public"
  }
}
