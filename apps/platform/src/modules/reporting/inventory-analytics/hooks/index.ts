import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { inventoryAnalytics, type InventoryAnalyticsParams } from '../services';

export const useInventoryAnalytics = (params: InventoryAnalyticsParams) =>
  useQuery({
    queryKey: ['inventory-analytics', params],
    queryFn: () => inventoryAnalytics(params),
    placeholderData: keepPreviousData,
  });
