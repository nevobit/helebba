import { createBrowserRouter } from 'react-router-dom';

import { privateRoutes } from './routes/PrivateRoutes';

export const router = createBrowserRouter([...privateRoutes]);
