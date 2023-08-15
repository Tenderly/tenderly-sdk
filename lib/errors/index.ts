export { ApiError } from './ApiError';
export { BytecodeMismatchError } from './BytecodeMismatchError';
export { CompilationError } from './CompilationError';
export { EncodingError } from './EncodingError';
import { errorHandlers } from './Error.handlerRegistry';
export type { TenderlyError } from './Error.types';
export { GeneralError } from './GeneralError';
export { InvalidArgumentsError } from './InvalidArgumentsError';
export { InvalidResponseError } from './InvalidResponseError';
export { NotFoundError } from './NotFoundError';
export { UnexpectedVerificationError } from './UnexpectedVerificationError';

export function handleError(error: Error | unknown) {
  errorHandlers.forEach(handler => handler.handle(error));
  throw error;
}
