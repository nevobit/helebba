import type { RouteObject } from 'react-router-dom';
import withSuspense from '@/app/router/utils/with-suspense';
import InventoryDashboard from '../screens/InventoryDashboard';

export const inventoryDashboardRoutes: RouteObject[] = [
  { path: '/inventory', element: withSuspense(<InventoryDashboard />) },
];
