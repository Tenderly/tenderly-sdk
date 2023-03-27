import { AxiosError, isAxiosError } from "axios";
import { WithRequired } from "../types";

export interface TenderlyError {
  readonly id: string;
  readonly message: string;
  readonly slug: string;
}

export interface ErrorHandler {
  handle: (error: Error) => void
}

type TenderlyAxiosError = WithRequired<AxiosError<{ error: TenderlyError }>, 'response'>;

export const isTenderlyAxiosError = (error: unknown): error is TenderlyAxiosError => {
  return isAxiosError<{ error: TenderlyError }>(error) && !!(error?.response?.data?.error && error?.response?.status);
};