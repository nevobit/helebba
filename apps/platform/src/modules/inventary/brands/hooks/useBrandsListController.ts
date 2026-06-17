import { useMemo, useState } from 'react';
import { toBrandRow } from '../mappers';
import { useBrands } from './useBrands';

export const useBrandsListController = () => {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);

  const { brands, error, isLoading, pageInfo, refetch, total } = useBrands({
    page,
    limit: pageSize,
    search: query,
  });

  const rows = useMemo(() => brands.map(toBrandRow), [brands]);
  const hasBrands = rows.length > 0;
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
    hasBrands,
    startItem,
    endItem,
    showPagination: hasBrands || isLoading,
    setPage,
    changeQuery,
    changePageSize,
  };
};
