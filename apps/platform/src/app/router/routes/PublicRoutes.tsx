import type { RouteObject } from 'react-router-dom';
import { PublicRoutes } from './route-paths';
import { guestLoader } from '@/app/router/loaders';
import Login from '@/modules/auth/screens/Login';
import Signup from '@/modules/auth/screens/Signup';
import VerifyCode from '@/modules/auth/screens/VerifyCode';
import AppleCallback from '@/modules/auth/screens/AppleCallback';

export const publicRoutes: RouteObject[] = [
  {
    path: PublicRoutes.LOGIN,
    loader: guestLoader,
    element: <Login />,
  },
  {
    path: PublicRoutes.LOGIN_VERIFY,
    loader: guestLoader,
    element: <VerifyCode mode="login" />,
  },
  {
    path: PublicRoutes.SIGNUP,
    loader: guestLoader,
    element: <Signup />,
  },
  {
    path: PublicRoutes.SIGNUP_VERIFY,
    loader: guestLoader,
    element: <VerifyCode mode="signup" />,
  },
  {
    path: PublicRoutes.APPLE_CALLBACK,
    loader: guestLoader,
    element: <AppleCallback />,
  },
];
