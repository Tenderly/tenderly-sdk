import { GeneralError } from "./GeneralError";

export const errorHandlers: { handle: ((error: Error) => void) }[] = [];

/**
 *  Use only as a decorator
 * @example
 * '@errorHandler 
 *    export class ApiError extends GeneralError {}
 *'
*/
export function errorHandler(handlerClass: typeof GeneralError & { handle: (error: Error) => void }) {
  errorHandlers.push(handlerClass);
}