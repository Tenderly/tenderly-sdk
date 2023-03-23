export interface TenderlyError {
  readonly id: string;
  readonly message: string;
  readonly slug: string;
}

export type ErrorHandler = {
  handle(error: Error): void;
}