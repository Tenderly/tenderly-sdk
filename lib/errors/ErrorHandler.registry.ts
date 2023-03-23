import { ErrorHandler } from "./models";

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