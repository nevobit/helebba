export type OffsetPageInfo = {
  page: number;
  pages: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
};

export type OffsetPaginatedResult<T> = {
  kind: 'offset';
  count: number;
  items: T[];
  pageInfo: OffsetPageInfo;
};

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type HelebbaClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export type HelebbaClient = {
  products: {
    list: (params?: ListParams) => Promise<OffsetPaginatedResult<Product>>;
    get: (productId: string) => Promise<Product>;
  };
  brands: {
    list: (params?: ListParams) => Promise<OffsetPaginatedResult<InventoryBrand>>;
  };
  categories: {
    list: (params?: ListParams) => Promise<OffsetPaginatedResult<Category>>;
  };
};

export type Product = Record<string, unknown> & {
  id: string;
  name: string;
  sku?: string;
  description?: string;
};

export type InventoryBrand = Record<string, unknown> & {
  id: string;
  name: string;
  description?: string;
};

export type Category = Record<string, unknown> & {
  id: string;
  name: string;
  description?: string;
};
