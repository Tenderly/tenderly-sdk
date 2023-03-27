import { errorHandlers } from './Error.handlerRegistry';

export function handleError(error: Error) {
  errorHandlers.forEach(handler => handler.handle(error));
  throw error;
}
