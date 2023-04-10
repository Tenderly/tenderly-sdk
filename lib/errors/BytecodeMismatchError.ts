import { GeneralError } from "./GeneralError";
import { BytecodeMismatchErrorResponse } from '../repositories/contracts/contracts.types';

export class BytecodeMismatchError extends GeneralError {
  private readonly apiError?: BytecodeMismatchErrorResponse;

  constructor(message: string, apiError?: BytecodeMismatchErrorResponse) {
    super({ message, id: 'local_error', slug: 'bytecode_mismatch_error' });
    this.apiError = apiError;
    this.name = 'BytecodeMismatchError';
  }

  static handle(error: BytecodeMismatchError) {
    if (error.slug === 'bytecode_mismatch_error') {
      console.log(error.message, 'The error is:', error.apiError);
      throw new BytecodeMismatchError(error.message);
    }
  }
}
