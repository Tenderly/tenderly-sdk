import { GeneralError } from "./GeneralError";
import { CompilationErrorResponse } from '../repositories/contracts/contracts.types';

export class CompilationError extends GeneralError<CompilationErrorResponse[]> {
  constructor(message: string, data?: CompilationErrorResponse[]) {
    super({ message, id: 'local_error', slug: 'compilation_error', data: data });
    this.name = 'CompilationError';
  }
}
