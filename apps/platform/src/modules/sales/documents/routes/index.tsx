import { authLoader } from '@/app/router/loaders';
import { PrivateRoutes } from '@/app/router/routes';
import withSuspense from '@/app/router/utils/with-suspense';
import type { RouteObject } from 'react-router-dom';
import DocumentList from '../screens/DocumentList';
import DocumentEdit from '../screens/DocumentEdit';
import DocumentNew from '../screens/DocumentNew';

export const documentRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.INVOICES,
    loader: authLoader,
    element: withSuspense(<DocumentList kind="invoice" />),
  },
  {
    path: `${PrivateRoutes.INVOICES}/new`,
    loader: authLoader,
    element: withSuspense(<DocumentNew kind="invoice" />),
  },
  {
    path: `${PrivateRoutes.INVOICES}/:documentId/edit`,
    loader: authLoader,
    element: withSuspense(<DocumentEdit kind="invoice" />),
  },
  {
    path: PrivateRoutes.ESTIMATES,
    loader: authLoader,
    element: withSuspense(<DocumentList kind="estimate" />),
  },
  {
    path: `${PrivateRoutes.ESTIMATES}/new`,
    loader: authLoader,
    element: withSuspense(<DocumentNew kind="estimate" />),
  },
  {
    path: `${PrivateRoutes.ESTIMATES}/:documentId/edit`,
    loader: authLoader,
    element: withSuspense(<DocumentEdit kind="estimate" />),
  },
  {
    path: PrivateRoutes.PURCHASES,
    loader: authLoader,
    element: withSuspense(<DocumentList kind="purchase" />),
  },
  {
    path: `${PrivateRoutes.PURCHASES}/new`,
    loader: authLoader,
    element: withSuspense(<DocumentNew kind="purchase" />),
  },
  {
    path: `${PrivateRoutes.PURCHASES}/:documentId/edit`,
    loader: authLoader,
    element: withSuspense(<DocumentEdit kind="purchase" />),
  },
];
