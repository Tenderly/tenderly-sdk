import { AxiosError } from "axios";
import { errorHandler } from ".";
import { GeneralError } from "./GeneralError";
import { TenderlyError } from "./TenderlyError";

@errorHandler
export class ApiError extends GeneralError {
  public readonly status: number;

  constructor({ status, ...error }: { status: number } & TenderlyError) {
    super(error);
    this.status = status;
  }

  static handle(error: AxiosError<{ error: TenderlyError }>) {
    if (error?.response?.data?.error && error?.response?.status) {
      throw new ApiError({ status: error.response.status, ...error.response.data.error as TenderlyError });
    }
  }
}