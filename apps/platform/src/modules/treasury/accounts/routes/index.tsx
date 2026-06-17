import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import AccountDetails from '../screens/AccountDetails';
import AccountsList from '../screens/AccountsList';

export const treasuryAccountRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.BANK_ACCOUNTS,
    loader: authLoader,
    children: [
      { index: true, element: withSuspense(<AccountsList />) },
      { path: ':accountId', element: withSuspense(<AccountDetails />) },
    ],
  },
];
