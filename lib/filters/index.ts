export type FilterFields = Record<string | symbol | undefined, unknown>;

export type FilterMap<T> = Map<string, (entity: T, value: unknown) => boolean>;

export function filterEntities<T, K extends FilterFields = FilterFields>(
  entities: T[],
  options: K,
  queryMap: FilterMap<T>,
) {
  return entities.filter(entity => {
    return Array.from(queryMap.entries()).every(([key, filter]) => {
      return filter(entity, options[key]);
    });
  });
}
