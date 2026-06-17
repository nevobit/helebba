import { useMemo } from 'react';
import { toWarehouseRow } from '../mappers';
import { useWarehouses } from './useWarehouses';

export const useWarehousesListController = () => {
  const { error, isLoading, refetch, total, warehouses } = useWarehouses({ page: 1, limit: 100, search: '' });
  const rows = useMemo(() => warehouses.map(toWarehouseRow), [warehouses]);

  return {
    rows,
    error,
    isLoading,
    refetch,
    total,
    hasWarehouses: rows.length > 0,
  };
};
