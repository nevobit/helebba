import type { RouteObject } from 'react-router-dom';
import AppShell from '@/app/components/Layout/AppShell';
import { authLoader } from '@/app/router/loaders';
import AccountSelection from '@/modules/accounts/screens/AccountSelection';
import OrganizationSetup from '@/modules/onboarding/screens/OrganizationSetup';
import { PrivateRoutes } from './route-paths';
import withSuspense from '@/app/router/utils/with-suspense';
import { contactsRoutes } from '@/modules/contacts/routes';
import { brandsRoutes } from '@/modules/inventary/brands/routes';
import { categoriesRoutes } from '@/modules/inventary/categories/routes';
import { productsRoutes } from '@/modules/inventary/products/routes';
import { warehousesRoutes } from '@/modules/inventary/warehouses/routes';
import { documentRoutes } from '@/modules/sales/documents/routes';
import { servicesRoutes } from '@/modules/sales/services/routes';
import { paymentRoutes } from '@/modules/accounting/payments/routes';
import { treasuryAccountRoutes } from '@/modules/treasury/accounts/routes';
import Summary from '@/modules/home/screens/Summary';

export const privateRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.ACCOUNTS,
    loader: authLoader,
    element: withSuspense(<AccountSelection />),
  },
  {
    path: PrivateRoutes.NEW_ACCOUNT,
    loader: authLoader,
    element: withSuspense(<OrganizationSetup />),
  },
  {
    path: PrivateRoutes.ROOT,
    loader: authLoader,
    element: withSuspense(<AppShell />),
    children: [
      {
        path: '/',
        loader: authLoader,
        element: withSuspense(<Summary />),
      },
      ...contactsRoutes,
      ...documentRoutes,
      ...servicesRoutes,
      ...productsRoutes,
      ...categoriesRoutes,
      ...brandsRoutes,
      ...warehousesRoutes,
      ...paymentRoutes,
      ...treasuryAccountRoutes,
    ],
  },
];
