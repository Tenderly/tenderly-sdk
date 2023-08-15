export interface Repository<T> {
  get: (uniqueId: string) => Promise<T | undefined>;
  add: (uniqueId: string, data: Partial<T>) => Promise<T | undefined>;
  remove: (uniqueId: string) => Promise<void>;
  update: (uniqueId: string, data: never) => Promise<unknown | undefined>;
  getBy: (queryObject: never) => Promise<T[] | undefined>;
  getAll: () => Promise<T[] | undefined>;
}
