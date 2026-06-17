import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import PaymentsList from '../screens/PaymentsList';

export const paymentRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.PAYMENTS,
    loader: authLoader,
    element: withSuspense(<PaymentsList />),
  },
];
