import { z } from 'zod';
import { Network } from './common.types';

export const pathSchema = z.string();

export const web3AddressSchema = z.string().length(42).startsWith('0x');

export const tenderlyConfigurationSchema = z.object({
  accountName: z.string(),
  projectName: z.string(),
  accessKey: z.string(),
  network: z.union([z.nativeEnum(Network), z.number()]),
});
