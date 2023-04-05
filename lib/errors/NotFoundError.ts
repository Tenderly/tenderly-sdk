import { GeneralError } from './GeneralError';

export class NotFoundError extends GeneralError {
  constructor(message: string) {
    super({ message, id: 'local_error', slug: 'resource_not_found' });
    this.name = 'NotFoundError';
  }
}
