import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import ServicesList from '../screens/ServicesList';

export const servicesRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.SERVICES,
    loader: authLoader,
    element: withSuspense(<ServicesList />),
  },
];
