import { TenderlyError } from './Error.types';

export abstract class GeneralError<T=unknown> extends Error implements TenderlyError {
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

  static handle(error: Error) {
    throw error;
  }
}
