import { z } from 'zod';
import {
  bytecodeMismatchErrorResponseSchema,
  compilationErrorResponseSchema,
  contractRequestSchema,
  contractResponseSchema,
  contractSchema,
  getByParamsSchema,
  solcConfigSchema,
  tenderlySolcConfigLibrariesSchema,
  updateContractRequestSchema,
  verificationRequestSchema,
  verificationResponseSchema,
} from './contracts.schema';

export type Contract = z.infer<typeof contractSchema>;
export type TenderlyContract = Contract;

export type ContractRequest = z.infer<typeof contractRequestSchema>;
export type GetByParams = z.infer<typeof getByParamsSchema>;
export type ContractResponse = z.infer<typeof contractResponseSchema>;
export type UpdateContractRequest = z.infer<typeof updateContractRequestSchema>;
export type SolcConfig = z.infer<typeof solcConfigSchema>;
export type TenderlySolcConfigLibraries = z.infer<typeof tenderlySolcConfigLibrariesSchema>;
export type VerificationRequest = z.infer<typeof verificationRequestSchema>;
export type VerificationResponse = z.infer<typeof verificationResponseSchema>;
export type CompilationErrorResponse = z.infer<typeof compilationErrorResponseSchema>;
export type BytecodeMismatchErrorResponse = z.infer<typeof bytecodeMismatchErrorResponseSchema>;
