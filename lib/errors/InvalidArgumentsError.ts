import { GeneralError } from './GeneralError';

export class InvalidArgumentsError extends GeneralError {
  constructor(message: string) {
    super({ id: 'local_error', message, slug: 'invalid_arguments' });
    this.name = 'InvalidArgumentsError';
  }
}
