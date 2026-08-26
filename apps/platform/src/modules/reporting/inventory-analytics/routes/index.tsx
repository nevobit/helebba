import type { RouteObject } from 'react-router-dom';
import withSuspense from '@/app/router/utils/with-suspense';
import InventoryAnalytics from '../screens/InventoryAnalytics';

export const reportingRoutes: RouteObject[] = [
  { path: '/reporting/inventoryanalytics', element: withSuspense(<InventoryAnalytics />) },
];
