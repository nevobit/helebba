import { useMemo, useState } from 'react';
import { useServices } from './useServices';
import { toServiceRow } from '../mappers';

export const useServicesListController = () => {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);

  const { error, isLoading, pageInfo, refetch, services, total } = useServices({
    page,
    limit: pageSize,
    search: query,
  });

  const rows = useMemo(() => services.map(toServiceRow), [services]);
  const hasServices = rows.length > 0;
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
    hasServices,
    startItem,
    endItem,
    showPagination: hasServices || isLoading,
    setPage,
    changeQuery,
    changePageSize,
  };
};
