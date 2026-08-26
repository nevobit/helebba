import type { RouteObject } from 'react-router-dom';
import withSuspense from '@/app/router/utils/with-suspense';
import FunnelBoard from '../screens/FunnelBoard';
import NewFunnel from '../screens/NewFunnel';
import OpportunityDetail from '../screens/OpportunityDetail';
import Activities from '../screens/Activities';
export const crmFunnelRoutes: RouteObject[] = [
  { path: '/crm/funnels', element: withSuspense(<FunnelBoard />) },
  { path: '/crm/funnels/:funnelId', element: withSuspense(<FunnelBoard />) },
  { path: '/crm/deals/:dealId', element: withSuspense(<OpportunityDetail />) },
  { path: '/crm/funnel/new', element: withSuspense(<NewFunnel />) },
  { path: '/crm/activities', element: withSuspense(<Activities />) },
];
