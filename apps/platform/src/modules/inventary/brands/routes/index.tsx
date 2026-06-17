import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import BrandsList from '../screens/BrandsList';

export const brandsRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.BRANDS,
    loader: authLoader,
    children: [{ index: true, element: withSuspense(<BrandsList />) }],
  },
];
