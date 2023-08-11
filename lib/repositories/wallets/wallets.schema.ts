import { z } from 'zod';
import { Network } from '../../common.types';
import { web3AddressSchema } from '../../common.schema';

export const walletSchema = z.object({
  address: web3AddressSchema,
  displayName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  network: z.nativeEnum(Network),
});

export const walletRequestSchema = z.object({
  address: web3AddressSchema,
  display_name: z.string(),
  network_ids: z.array(z.string()),
});

export const walletResponseSchema = z.object({
  id: z.string(),
  account_type: z.literal('wallet'),
  display_name: z.string(),
  account: z.object({
    id: z.string(),
    contract_id: z.string(),
    balance: z.string(),
    network_id: z.string(),
    address: web3AddressSchema,
  }),
  contract: z
    .object({
      id: z.string(),
      contract_id: z.string(),
      balance: z.string(),
      network_id: z.string(),
      address: web3AddressSchema,
    })
    .optional(),
  wallet: z
    .object({
      id: z.string(),
      contract_id: z.string(),
      balance: z.string(),
      network_id: z.string(),
      address: web3AddressSchema,
    })
    .optional(),
  tags: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
});

export const updateWalletRequestSchema = z.object({
  displayName: z.string().optional(),
  appendTags: z.array(z.string()).optional(),
});
