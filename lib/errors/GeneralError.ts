import { TenderlyError } from "./TenderlyError";

export abstract class GeneralError extends Error implements TenderlyError {
  public readonly id: string;
  public readonly message: string;
  public readonly slug: string;

  constructor({ id, message, slug }: TenderlyError) {
    super(message);
    this.id = id;
    this.message = message;
    this.slug = slug;
  }

  static handle(error: Error) {
    throw error;
  }
}