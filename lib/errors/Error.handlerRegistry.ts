import { ApiError } from './ApiError';
import { ErrorHandler } from './Error.types';
import { GeneralError } from './GeneralError';

export const errorHandlers: ErrorHandler[] = [ApiError, GeneralError];

export function errorHandler(handlerClass: ErrorHandler) {
  errorHandlers.push(handlerClass);
}
