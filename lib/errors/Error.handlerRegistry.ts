import { ApiError } from './ApiError';
import { ErrorHandler } from './Error.types';
import { BytecodeMismatchError } from "./BytecodeMismatchError";
import { CompilationError } from "./CompilationError";

export const errorHandlers: Set<ErrorHandler> = new Set([CompilationError, BytecodeMismatchError, ApiError]);

export function errorHandler(handlerClass: ErrorHandler) {
  errorHandlers.add(handlerClass);
}
