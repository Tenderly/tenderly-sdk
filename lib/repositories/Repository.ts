export interface Repository<T> {
  get: (uniqueId: string) => Promise<T>;
  add: (uniqueId: string, data: Partial<T>) => Promise<T>;
  remove: (uniqueId) => Promise<void>;
  update: <UpdateableFields>(uniqueId, data: UpdateableFields) => Promise<T>;
  getBy: (queryObject: unknown) => Promise<T[]>;
  getAll: () => Promise<T[]>;
}
