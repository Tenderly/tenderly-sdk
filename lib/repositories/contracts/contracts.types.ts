import { Network, Path, Web3Address } from '../../types';

export interface Contract {
  address: string;
  network: Network;
  displayName?: string;
  tags?: string[];
}

export type TenderlyContract = Contract;

export interface ContractRequest extends Record<string, string> {
  address: string;
  network_id: string;
}

export type GetByParams = {
  tags?: string | string[];
  displayName?: string | string[];
  network?: Network | Network[];
};

export type ContractResponse = {
  id: string;
  account_type: 'contract';
  contract: {
    id: string;
    contract_id: string;
    balance: string;
    network_id: string;
    public: boolean;
    export: boolean;
    verified_by: string;
    verification_date: string | null;
    address: string;
    contract_name: string;
    ens_domain: string | null;
    type: string;
    standard: string;
    standards: string[];
    token_data: {
      symbol: string;
      name: string;
      main: boolean;
    };
    evm_version: string;
    compiler_version: string;
    optimizations_used: boolean;
    optimization_runs: number;
    libraries: null;
    data: {
      main_contract: number;
      contract_info: {
        id: number;
        path: string;
        name: string;
        source: string;

        abi: unknown[];
        raw_abi: unknown[];
        states: unknown[];
      } | null;
      creation_block: number;
      creation_tx: string;
      creator_address: string;
      created_at: string;
      number_of_watches: null;
      language: string;
      in_project: boolean;
      number_of_files: number;
    };
    account: {
      id: string;
      contract_id: string;
      balance: string;
      network_id: string;
      public: boolean;
      export: boolean;
      verified_by: string;
      verification_date: string | null;
      address: string;
      contract_name: string;
      ens_domain: string | null;
      type: string;
      standard: string;
      standards: string[];
      evm_version: string;
      compiler_version: string;
      optimizations_used: boolean;
      optimization_runs: number;
      libraries: null;
      data: null;
      creation_block: number;
      creation_tx: string;
      creator_address: string;
      created_at: string;
      number_of_watches: null;
      language: string;
      in_project: boolean;
      number_of_files: number;
    };
    project_id: string;
    added_by_id: string;
    previous_versions: unknown[];
    details_visible: boolean;
    include_in_transaction_listing: boolean;
    display_name: string;
    account_type: string;
    verification_type: string;
    added_at: string;
  };
  display_name: string;
  tags?: {
    tag: string;
  }[];
};

export type UpdateContractRequest = {
  displayName?: string;
  appendTags?: string[];
};

export enum SolidityCompilerVersions {
  v0_8_4 = 'v0.8.4',
  v0_8_13 = 'v0.8.13',
  v0_8_17 = 'v0.8.17',
  v0_8_19 = 'v0.8.19',
}

export type VerificationRequest = {
  mode: 'private' | 'public';
  contractToVerify: Path;
  solc: {
    compiler: {
      version: SolidityCompilerVersions;
      settings: {
        optimizer: {
          enabled: boolean;
          runs: number;
        };
        libraries?: Record<Path, Record<string, Web3Address>>;
      };
    };
    sources: Record<Path, { name: string; code: string }>;
  };
};
