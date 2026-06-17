import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import WarehousesList from '../screens/WarehousesList';

export const warehousesRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.WAREHOUSES,
    loader: authLoader,
    children: [{ index: true, element: withSuspense(<WarehousesList />) }],
  },
];
