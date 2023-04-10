import { errorHandlers } from './Error.handlerRegistry';
export { GeneralError } from './GeneralError';
export { ApiError } from './ApiError';
export type { TenderlyError } from './Error.types';
export { NotFoundError } from './NotFoundError';
export { InvalidArgumentsError } from './InvalidArgumentsError';

export function handleError(error: Error) {
  errorHandlers.forEach(handler => handler.handle(error));
  throw error;
}
