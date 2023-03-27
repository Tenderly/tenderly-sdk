import { AxiosError } from 'axios';
import { errorHandler } from './Error.handlerRegistry';
import { GeneralError } from './GeneralError';
import { isTenderlyAxiosError, TenderlyError } from './Error.types';

@errorHandler
export class ApiError extends GeneralError {
  public readonly status: number;

  constructor({ status, ...error }: { status: number } & TenderlyError) {
    super(error);
    this.status = status;
  }

  static handle(error: AxiosError<{ error: TenderlyError }>) {
    if (isTenderlyAxiosError(error)) {
      throw new ApiError({ status: error.response.status, ...error.response.data.error });
    }
  }
}
