import { GeneralError } from "./GeneralError";
import { CompilationErrorResponse } from '../repositories/contracts/contracts.types';

export class CompilationError extends GeneralError {
  private readonly apiErrors?: CompilationErrorResponse[];

  constructor(message: string, apiErrors?: CompilationErrorResponse[]) {
    super({ message, id: 'local_error', slug: 'compilation_error' });
    this.apiErrors = apiErrors;
    this.name = 'CompilationError';
  }

  static handle(error: CompilationError) {
    if (error.slug === 'compilation_error') {
      console.log(error.message, '\nThe errors are: ', error.apiErrors);
      throw new CompilationError(error.message);
    }
  }
}
