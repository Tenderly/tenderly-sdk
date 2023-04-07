import { ErrorHandler } from './Error.types';

export const errorHandlers: Set<ErrorHandler> = new Set();

export function errorHandler(handlerClass: ErrorHandler) {
  errorHandlers.add(handlerClass);
}
