import { useMemo, useState } from 'react';
import { toCategoryRow } from '../mappers';
import { useCategories } from './useProducts';

export const useCategoriesListController = () => {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);

  const { categories, error, isLoading, pageInfo, refetch, total } = useCategories({
    page,
    limit: pageSize,
    search: query,
  });

  const rows = useMemo(() => categories.map(toCategoryRow), [categories]);
  const hasCategories = rows.length > 0;
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
    hasCategories,
    startItem,
    endItem,
    showPagination: hasCategories || isLoading,
    setPage,
    changeQuery,
    changePageSize,
  };
};
