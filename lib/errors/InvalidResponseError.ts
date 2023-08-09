import { GeneralError } from './GeneralError';

export class InvalidResponseError extends GeneralError {
  constructor(message: string) {
    super({ id: 'local_error', message, slug: 'invalid_response' });
    this.name = 'InvalidResponseError';
  }
}
