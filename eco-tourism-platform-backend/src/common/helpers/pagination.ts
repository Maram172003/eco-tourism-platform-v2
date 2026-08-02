export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function parsePagination(
  query: { page?: string; limit?: string },
  defaults = { page: 1, limit: 20 },
): PaginationParams {
  const page = Math.max(
    1,
    parseInt(query.page ?? String(defaults.page), 10) || defaults.page,
  );
  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(query.limit ?? String(defaults.limit), 10) || defaults.limit,
    ),
  );
  return { page, limit };
}
