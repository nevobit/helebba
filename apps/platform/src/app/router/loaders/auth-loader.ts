import { useSession } from '@/shared';
import { redirect } from 'react-router-dom';
import { PublicRoutes } from '@/app/router/routes/route-paths';

export function authLoader() {
  const isAuth = useSession.getState().isAuthenticated();
  if (!isAuth) throw redirect(PublicRoutes.LOGIN);
  return null;
}
