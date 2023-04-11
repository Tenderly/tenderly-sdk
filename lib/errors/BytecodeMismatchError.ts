import { GeneralError } from "./GeneralError";
import { BytecodeMismatchErrorResponse } from '../repositories/contracts/contracts.types';

export class BytecodeMismatchError extends GeneralError<BytecodeMismatchErrorResponse> {
  constructor(message: string, data?: BytecodeMismatchErrorResponse) {
    super({ message, id: 'local_error', slug: 'bytecode_mismatch_error', data: data });
    this.name = 'BytecodeMismatchError';
  }
}
