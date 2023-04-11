import { GeneralError } from "./GeneralError";

export class UnexpectedVerificationError extends GeneralError {
  constructor(message: string) {
    super({ message, id: 'local_error', slug: 'unexpected_verification_error'});
    this.name = 'UnexpectedVerificationError';
  }
}
