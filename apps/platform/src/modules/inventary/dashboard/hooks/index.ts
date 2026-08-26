import { useQuery } from '@tanstack/react-query';
import { inventoryDashboard } from '../services';

export const useInventoryDashboard = () =>
  useQuery({ queryKey: ['inventory-dashboard'], queryFn: inventoryDashboard });
