import { Network, Path, Web3Address } from '../../types';

export interface Contract {
  address: string;
  network: Network;
  displayName?: string;
  tags?: string[];
}

export type TenderlyContract = Contract;

export interface ContractRequest {
  address: string;
  network_id: string;
  display_name?: string;
}

export type GetByParams = {
  tags?: string[];
  displayNames?: string[];
};

export type ContractResponse = {
  id: string;
  account_type: 'contract';
  contract: InternalContract;
  display_name: string;
  tags?: {
    tag: string;
  }[];
};

interface InternalContract {
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
}

export type UpdateContractRequest = {
  displayName?: string;
  appendTags?: string[];
};

export type SolidityCompilerVersions = `v${number}.${number}.${number}`;

export type SolcConfig = {
  version: SolidityCompilerVersions;
  sources: Record<Path, { content: string }>;
  settings: {
    optimizer?: {
      enabled: boolean;
      runs?: number;
    };
    libraries?: Record<Path, Record<string, Web3Address>>;
  };
};

// TenderlySolcConfig is the same as SolcConfig, but with a different library structure for internal reasons
// also, sources shouldn't be included here as they are specified inside the verification request
export type TenderlySolcConfig = {
  version: SolidityCompilerVersions;
  settings: {
    optimizer?: {
      enabled: boolean;
      runs?: number;
    };
    libraries?: {
      [fileName: string]: {
        addresses: {
          [libName: string]: string;
        };
      };
    };
  };
};

export type VerificationRequest = {
  contractToVerify: string;
  solc: SolcConfig;
  config: {
    mode: 'private' | 'public';
  };
};

export type VerificationResponse = {
  compilation_errors: CompilationErrorResponse[];
  results: VerificationResult[];
}

export type CompilationErrorResponse= {
  source_location: SourceLocation;
  error_ype: string;
  component: string;
  message: string;
  formatted_message: string;
}

interface SourceLocation {
  file: string;
  start: number;
  end: number;
}

interface VerificationResult {
  bytecode_mismatch_error: BytecodeMismatchErrorResponse;
  verified_contract: InternalContract;
}

export type BytecodeMismatchErrorResponse= {
  contract_id: string;
  expected: string;
  got: string;
  similarity: number;
  assumed_reason: string;
}
