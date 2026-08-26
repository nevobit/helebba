import { api } from '@/shared/api';

export type InventoryAnalyticsRow = {
  id: string;
  sku: string;
  name: string;
  variant1: string;
  variant2: string;
  salesUnits: number;
  salesTotal: number;
  averageSalePrice: number;
  averageCost: number;
  margin: number;
};
export type InventoryAnalyticsResponse = {
  items: InventoryAnalyticsRow[];
  totalItems: number;
  page: number;
  limit: number;
};
export type InventoryAnalyticsParams = {
  startDate: string;
  endDate: string;
  search: string;
  page: number;
  limit: number;
};
export const inventoryAnalytics = async (params: InventoryAnalyticsParams) =>
  (await api.get<InventoryAnalyticsResponse>('/products/inventory-analytics', { params })).data;
