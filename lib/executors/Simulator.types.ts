import { Web3Address } from '../common.types';

export type TransactionParameters = {
  from: Web3Address;
  to: Web3Address;
  input: string;
  gas: number;
  gas_price: string;
  max_fee_per_gas?: number;
  max_priority_fee_per_gas?: number;
  value: string | number;
  access_list?: AccessList;
};

type AccessList = {
  value_address: string;
  value_storage_keys: string[];
}[];

export type SimulationRequestOverrides = {
  [contractAddress: Web3Address]: SimulationRequestOverride;
};

export type SimulationRequestOverride = {
  nonce?: number;
  code?: string;
  balance?: string;
  state_diff?: {
    [storageKey: string]: string | unknown;
  };
};

export type SimulationRequest = {
  // FIXME: this should be a number, but the API expects a string
  network_id: string;
  call_args: SimulationCallArguments;
  block_number_or_hash: {
    blockNumber: number;
  };
  overrides?: SimulationRequestOverrides | null;
};

export type SimulationBundleRequest = {
  network_id: string;
  call_args: SimulationCallArguments[];
  block_number_or_hash: {
    blockNumber: number;
  };
  overrides?: SimulationRequestOverrides | null;
};

export type SimulationCallArguments = {
  from: string;
  to: string;
  gas: number;
  gas_price?: string;
  max_fee_per_gas?: number;
  max_priority_fee_per_gas?: number;
  value: string | number;
  data: string;
  access_list?: AccessList;
};

export type SimulationBundleDetails = {
  transactions: TransactionParameters[];
  blockNumber: number;
  overrides?: SimulationParametersOverrides | null;
};

export type SimulationParametersOverrides = {
  [contractAddress: Web3Address]: SimulationParametersOverride;
};

export type SimulationParametersOverride = {
  nonce?: number;
  code?: string;
  balance?: string;
  state?: {
    [property: string]: unknown;
  };
};

export type SimulationParameters = {
  transaction: TransactionParameters;
  blockNumber: number;
  overrides?: SimulationParametersOverrides | null;
};

export type SimulationOutput = {
  status?: boolean;
  gasUsed?: number;
  cumulativeGasUsed?: number;
  blockNumber?: number;
  type?: number;
  logsBloom?: Uint8Array;
  logs?: SimulateSimpleResponse_DecodedLog[];
  trace?: SimulateSimpleResponse_TraceResponse[];
};

export interface SimulateBundleResponse {
  simulations: SimulateSimpleResponse[];
}

export interface SimulateSimpleResponse {
  status?: boolean;
  gas_used?: number;
  cumulative_gas_used?: number;
  block_number?: number;
  type?: number;
  logs_bloom?: Uint8Array;
  logs?: SimulateSimpleResponse_DecodedLog[];
  trace?: SimulateSimpleResponse_TraceResponse[];
}

export type StateOverride = Record<Web3Address, { value: Record<string, unknown> }>;

export type EncodeStateRequest = {
  networkID: string;
  stateOverrides: StateOverride;
};

export type EncodedStateOverride = Record<Web3Address, Record<string, unknown>>;

interface SimulateSimpleResponse_DecodedLog {
  name?: string;
  anonymous?: boolean;
  inputs?: SimulateSimpleResponse_DecodedArgument[];
  raw?: RawEvent;
}

interface SimulateSimpleResponse_DecodedArgument {
  value?: unknown;
  type?: string;
  name?: string;
}

export interface RawEvent {
  address?: string;
  topics: string[];
  data: string;
}

export interface SimulateSimpleResponse_TraceResponse {
  type?: string;
  from?: string;
  to?: string;
  gas?: number;
  gas_used?: number;
  address?: string | null;
  balance?: number | null;
  refund_address?: string | null;
  value?: number | null;
  error?: string | null;
  /**
   * @deprecated Use {@link error_reason} instead
   */
  error_messages?: string | null;
  error_reason?: string | null;
  input?: string | null;
  decoded_input?: SimulateSimpleResponse_DecodedArgument[];
  method?: string | null;
  output?: string | null;
  decoded_output?: SimulateSimpleResponse_DecodedArgument[];
  subtraces?: number;
  trace_address?: number[];
}
