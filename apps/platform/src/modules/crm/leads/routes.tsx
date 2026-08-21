import type { RouteObject } from 'react-router-dom';
import { PrivateRoutes } from '@/app/router/routes/route-paths';
import { authLoader } from '@/app/router/loaders';
import LeadBoard from '@/modules/crm/leads/screens/LeadBoard';
import LeadDetail from '@/modules/crm/leads/screens/LeadDetail';

export const crmLeadRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.CRM_LEADS,
    loader: authLoader,
    element: <LeadBoard />,
  },
  {
    path: PrivateRoutes.CRM_LEAD_DETAIL,
    loader: authLoader,
    element: <LeadDetail />,
  },
  {
    path: PrivateRoutes.CRM_LEAD_BOARD,
    loader: authLoader,
    element: <LeadBoard />,
  },
];