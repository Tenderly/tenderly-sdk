import { ErrorHandler } from './Error.types';

export const errorHandlers: ErrorHandler[] = [];

/**
 *  Use only as a decorator
 * @example
 * '@errorHandler
 *    export class ApiError extends GeneralError {}
 *'
 */
export function errorHandler(handlerClass: ErrorHandler) {
  errorHandlers.push(handlerClass);
}
