export interface Repository<T> {
  get: (uniqueId: string) => Promise<T | undefined>;
  add: (uniqueId: string, data: Partial<T>) => Promise<T | undefined>;
  remove: (uniqueId) => Promise<void>;
  update: <UpdateableFields>(uniqueId, data: UpdateableFields) => Promise<unknown | undefined>;
  getBy: (queryObject: unknown) => Promise<T[] | undefined>;
  getAll: () => Promise<T[] | undefined>;
}
