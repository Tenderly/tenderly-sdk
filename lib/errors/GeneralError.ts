import { TenderlyError } from './Error.types';

export abstract class GeneralError<T = unknown> extends Error implements TenderlyError {
  public readonly id?: string;
  public readonly message: string;
  public readonly slug: string;
  public readonly data?: T;

  constructor({ id, message, slug, data }: TenderlyError & { data?: T }) {
    super(message);
    this.id = id;
    this.message = message;
    this.slug = slug;
    this.data = data;
  }

  static handle(error: Error | unknown) {
    if (error instanceof Error) throw error;

    // In case we do not know the error type we will convert to string and throw it anyway
    throw new Error(JSON.stringify(error));
  }
}
