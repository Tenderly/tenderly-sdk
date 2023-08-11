import { z } from 'zod';
import { Network } from '../../common.types';
import { web3AddressSchema } from '../../common.schema';

export const contractSchema = z.object({
  address: web3AddressSchema,
  network: z.nativeEnum(Network),
  displayName: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const contractRequestSchema = z.object({
  address: web3AddressSchema,
  network_id: z.string(),
  display_name: z.string().optional(),
});

export const getByParamsSchema = z.object({
  tags: z.array(z.string()).optional(),
  displayNames: z.array(z.string()).optional(),
});

const internalContractSchema = z.object({
  id: z.string(),
  contract_id: z.string(),
  balance: z.string(),
  network_id: z.string(),
  public: z.boolean(),
  export: z.boolean(),
  verified_by: z.string(),
  verification_date: z.string().nullable(),
  address: web3AddressSchema,
  contract_name: z.string(),
  ens_domain: z.string().nullable(),
  type: z.string(),
  standard: z.string(),
  standards: z.array(z.string()),
  token_data: z.object({
    symbol: z.string(),
    name: z.string(),
    main: z.boolean(),
  }),
  evm_version: z.string(),
  compiler_version: z.string(),
  optimizations_used: z.boolean(),
  optimization_runs: z.number(),
  libraries: z.null(),
  data: z.object({
    main_contract: z.number(),
    contract_info: z
      .object({
        id: z.number(),
        path: z.string(),
        name: z.string(),
        source: z.string(),
        abi: z.array(z.unknown()),
        raw_abi: z.array(z.unknown()),
        states: z.array(z.unknown()),
      })
      .nullable(),
    creation_block: z.number(),
    creation_tx: z.string(),
    creator_address: web3AddressSchema,
    created_at: z.string(),
    number_of_watches: z.null(),
    language: z.string(),
    in_project: z.boolean(),
    number_of_files: z.number(),
  }),
  account: z.object({
    id: z.string(),
    contract_id: z.string(),
    balance: z.string(),
    network_id: z.string(),
    public: z.boolean(),
    export: z.boolean(),
    verified_by: z.string(),
    verification_date: z.string().nullable(),
    address: web3AddressSchema,
    contract_name: z.string(),
    ens_domain: z.string().nullable(),
    type: z.string(),
    standard: z.string(),
    standards: z.array(z.string()),
    evm_version: z.string(),
    compiler_version: z.string(),
    optimizations_used: z.boolean(),
    optimization_runs: z.number(),
    libraries: z.null(),
    data: z.null(),
    creation_block: z.number(),
    creation_tx: z.string(),
    creator_address: web3AddressSchema,
    created_at: z.string(),
    number_of_watches: z.null(),
    language: z.string(),
    in_project: z.boolean(),
    number_of_files: z.number(),
  }),
  project_id: z.string(),
  added_by_id: z.string(),
  previous_versions: z.array(z.unknown()),
  details_visible: z.boolean(),
  include_in_transaction_listing: z.boolean(),
  display_name: z.string(),
  account_type: z.string(),
  verification_type: z.string(),
  added_at: z.string(),
});

export const updateContractRequestSchema = z.object({
  displayName: z.string().optional(),
  appendTags: z.array(z.string()).optional(),
});

export const solidityCompilerVersionsSchema = z
  .string()
  .regex(new RegExp('^v\\d+\\.\\d+\\.\\d+$'), {
    message: 'Compiler version is not in supported format v[number].[number].[number]',
  });

export const solcConfigSchema = z.object({
  version: solidityCompilerVersionsSchema,
  sources: z.record(
    z.object({
      content: z.string(),
    }),
  ),
  settings: z.unknown(),
});

export const tenderlySolcConfigLibrariesSchema = z.record(
  z.object({
    addresses: z.record(web3AddressSchema),
  }),
);

export const verificationRequestSchema = z.object({
  contractToVerify: z.string(),
  solc: solcConfigSchema,
  config: z.object({
    mode: z.union([z.literal('private'), z.literal('public')]),
  }),
});

export const bytecodeMismatchErrorResponseSchema = z.object({
  contract_id: z.string(),
  expected: z.string(),
  got: z.string(),
  similarity: z.number(),
  assumed_reason: z.string(),
});

export const contractResponseSchema = z.object({
  id: z.string(),
  account_type: z.literal('contract'),
  contract: internalContractSchema,
  display_name: z.string(),
  tags: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
});

export const compilationErrorResponseSchema = z.object({
  source_location: z.object({
    file: z.string(),
    start: z.number(),
    end: z.number(),
  }),
  error_ype: z.string(),
  component: z.string(),
  message: z.string(),
  formatted_message: z.string(),
});

export const verificationResponseSchema = z.object({
  compilation_errors: z.array(compilationErrorResponseSchema),
  results: z.array(
    z.object({
      bytecode_mismatch_error: bytecodeMismatchErrorResponseSchema,
      verified_contract: internalContractSchema,
    }),
  ),
});
