import { GeneralError } from './GeneralError';
import { TenderlyError } from './Error.types';

export class EncodingError extends GeneralError {
  constructor(error: TenderlyError) {
    super(error);
    this.name = 'EncodingError';
  }
}
