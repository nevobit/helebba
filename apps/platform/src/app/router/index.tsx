import { createBrowserRouter, Outlet } from 'react-router-dom';

import { SessionWatcher } from '@/app/components/SessionWatcher';
import { privateRoutes } from './routes/PrivateRoutes';
import { publicRoutes } from './routes/PublicRoutes';

export const router = createBrowserRouter([
  {
    element: (
      <>
        <SessionWatcher />
        <Outlet />
      </>
    ),
    children: [
      ...publicRoutes,
      ...privateRoutes,
      { path: '*', element: <div>Not Found</div> },
    ],
  },
]);
