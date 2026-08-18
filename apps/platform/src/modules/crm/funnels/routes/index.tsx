import type { RouteObject } from 'react-router-dom';
import withSuspense from '@/app/router/utils/with-suspense';
import FunnelBoard from '../screens/FunnelBoard';
import NewFunnel from '../screens/NewFunnel';
export const crmFunnelRoutes: RouteObject[] = [
  { path: '/crm/funnels', element: withSuspense(<FunnelBoard />) },
  { path: '/crm/funnels/:funnelId', element: withSuspense(<FunnelBoard />) },
  { path: '/crm/funnel/new', element: withSuspense(<NewFunnel />) },
];
