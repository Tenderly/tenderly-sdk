import { errorHandlers } from "./ErrorHandler.registry";
export { errorHandler } from "./ErrorHandler.registry";

export function handleError(error: Error) {
  errorHandlers.forEach(handler => handler.handle(error));
  throw error;
}