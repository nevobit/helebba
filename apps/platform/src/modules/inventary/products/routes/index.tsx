import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import ProductsList from '../screens/ProductsList';
import ProductDetails from '../screens/ProductDetails';

export const productsRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.PRODUCTS,
    loader: authLoader,
    children: [
      { index: true, element: withSuspense(<ProductsList />) },
      { path: ':productId', element: withSuspense(<ProductDetails />) },
    ],
  },
];
