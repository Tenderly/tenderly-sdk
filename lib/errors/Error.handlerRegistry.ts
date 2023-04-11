import { ApiError } from './ApiError';
import { ErrorHandler } from './Error.types';

export const errorHandlers: Set<ErrorHandler> = new Set([ApiError]);

export function errorHandler(handlerClass: ErrorHandler) {
  errorHandlers.add(handlerClass);
}
