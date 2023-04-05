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
  tags?: string[];
  displayNames?: string[];
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

// abomination. Leaving it just in case we can't fix this before release and we need to revert to the old API
// export type AlreadyAddedContractResponse = {
//   // id: 'eth:1:0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
//   id: string;
//   // project_id: '606aefca-49d9-4b3b-adba-75fe8f610f17',
//   project_id: string;
//   // added_by_id: 'ec6c0c98-c4fd-4ce7-8d68-d33062b6b2ae',
//   added_by_id: string;
//   // details_visible: true,
//   details_visible: boolean;

//   // include_in_transaction_listing: true;
//   include_in_transaction_listing: boolean;
//   // display_name: 'Unverified Contract';

//   display_name: string;
//   account_type: 'unverified_contract' | 'contract' | 'wallet';
//   // added_at: '2023-04-05 09:38:18.686258 +0000 UTC';
//   added_at: string;
// };

// export function isAlreadyAddedContractResponse(
//   contractResponse: ContractResponse | AlreadyAddedContractResponse,
// ): contractResponse is AlreadyAddedContractResponse {
//   return !(contractResponse as ContractResponse).contract;
// }

export type UpdateContractRequest = {
  displayName?: string;
  appendTags?: string[];
};

export enum SolidityCompilerVersions {
  v0_8_4 = 'v0.8.4',
  v0_8_13 = 'v0.8.13',
  v0_8_17 = 'v0.8.17',
}

export type VerificationRequest = {
  solc: {
    compiler: {
      version: SolidityCompilerVersions;
      settings: {
        optimizer: {
          enabled: boolean;
          runs: number;
        };
        libraries: Record<Path, Record<string, Web3Address>>;
      };
    };
    sources: Record<Path, { name: string; source: string }>;
  };
  config: {
    mode: 'private' | 'public';
  };
};
