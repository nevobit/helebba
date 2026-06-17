import { useMemo, useState } from 'react';
import { useProducts } from './useProducts';
import { toProductRow } from '../mappers';

export const useProductsListController = () => {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);

  const { error, isLoading, pageInfo, products, refetch, total } = useProducts({
    page,
    limit: pageSize,
    search: query,
  });

  const rows = useMemo(() => products.map(toProductRow), [products]);
  const hasProducts = rows.length > 0;
  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = total > 0 ? startItem + rows.length - 1 : 0;

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    query,
    page,
    pageSize,
    rows,
    error,
    isLoading,
    pageInfo,
    refetch,
    total,
    hasProducts,
    startItem,
    endItem,
    showPagination: hasProducts || isLoading,
    setPage,
    changeQuery,
    changePageSize,
  };
};
