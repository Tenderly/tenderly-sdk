import { z } from 'zod';
import { Network } from '../../types';

const ethAddress = z.string().length(42).startsWith('0x');

export const networkSchema = z.nativeEnum(Network);

export const walletSchema = z.object({
  address: ethAddress,
  displayName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  network: networkSchema,
});

export const walletRequestSchema = z.object({
  address: ethAddress,
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
    address: ethAddress,
  }),
  contract: z
    .object({
      id: z.string(),
      contract_id: z.string(),
      balance: z.string(),
      network_id: z.string(),
      address: ethAddress,
    })
    .optional(),
  wallet: z
    .object({
      id: z.string(),
      contract_id: z.string(),
      balance: z.string(),
      network_id: z.string(),
      address: ethAddress,
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
