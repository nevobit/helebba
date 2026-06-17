import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import CategoriesList from '../screens/ProductsList';

export const categoriesRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.CATEGORIES,
    loader: authLoader,
    children: [{ index: true, element: withSuspense(<CategoriesList />) }],
  },
];
