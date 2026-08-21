import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import ContactDetail from '../screens/ContactDetail';
import ContactsList from '../screens/ContactsList';

export const contactsRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.CONTACTS,
    loader: authLoader,
    children: [
      { index: true, element: withSuspense(<ContactsList />) },
      { path: ':id', element: withSuspense(<ContactDetail />) },
    ],
  },
];
