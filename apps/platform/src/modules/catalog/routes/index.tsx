import type { RouteObject } from 'react-router-dom';
import CatalogList from '../screens/CatalogList';
import withSuspense from '@/app/router/utils/with-suspense';
export const catalogRoutes: RouteObject[] = [{ path: '/catalog', element: withSuspense(<CatalogList />) }];
