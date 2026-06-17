import { createBrowserRouter } from 'react-router-dom';

import { privateRoutes } from './routes/PrivateRoutes';
import { publicRoutes } from './routes/PublicRoutes';

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  { path: '*', element: <div>Not Found</div> },
]);
