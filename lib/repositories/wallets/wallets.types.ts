import { z } from 'zod';
import {
  updateWalletRequestSchema,
  walletRequestSchema,
  walletResponseSchema,
  walletSchema,
} from './wallets.schema';

export type Wallet = z.infer<typeof walletSchema>;
export type TenderlyWallet = Wallet;

export type WalletRequest = z.infer<typeof walletRequestSchema>;
export type WalletResponse = z.infer<typeof walletResponseSchema>;
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>;
