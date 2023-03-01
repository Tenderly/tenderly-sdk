export interface Repository<T> {
  get: (uniqueId: string) => Promise<T>;
  add: (uniqueId: string, data: Partial<T>) => Promise<T>;
  remove: (uniqueId) => Promise<void>;
  update: (uniqueId, data: Partial<T>) => Promise<T>;
  getBy: (queryObject: Partial<T>) => Promise<T>;
}