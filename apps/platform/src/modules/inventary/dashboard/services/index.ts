import { api } from '@/shared/api';

export type InventoryOrderSummary = { units: number; total: number };
export type InventoryDashboardData = {
  productUnits: number;
  stockValue: number;
  averageCost: number;
  orders: {
    sales: InventoryOrderSummary;
    purchases: InventoryOrderSummary;
    manufacturing: InventoryOrderSummary;
    salesDeliveryNotes: InventoryOrderSummary;
    purchaseDeliveryNotes: InventoryOrderSummary;
  };
};

export const inventoryDashboard = async () =>
  (await api.get<InventoryDashboardData>('/products/dashboard')).data;
