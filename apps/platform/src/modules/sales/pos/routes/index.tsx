import type { RouteObject } from 'react-router-dom';
import withSuspense from '@/app/router/utils/with-suspense';
import PosDashboard from '../screens/PosDashboard';
import StoreDetails from '../screens/StoreDetails';
import PosTerminal from '../screens/PosTerminal';
export const posRoutes: RouteObject[] = [
  { path: '/pos', element: withSuspense(<PosDashboard />) },
  { path: '/pos/:storeId', element: withSuspense(<StoreDetails />) },
  { path: '/pos/:storeId/register/:registerId', element: withSuspense(<PosTerminal />) },
];
