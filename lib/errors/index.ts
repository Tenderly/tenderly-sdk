import { GeneralError } from "./GeneralError";

const errorHandlers: { handle: ((error: Error) => void) }[] = [];

/**
 *  Use only as a decorator
 * @example
 * '@errorHandler 
 *    export class ApiError extends GeneralError {}
 *'
*/
export function errorHandler(handlerClass: typeof GeneralError) {
  errorHandlers.push(handlerClass);
}

export function handleError(error: Error) {
  errorHandlers.forEach(handler => handler.handle(error));
  throw error;
}