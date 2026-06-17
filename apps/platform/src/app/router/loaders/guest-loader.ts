import { useSession } from '@/shared';
import { redirect } from 'react-router-dom';
import { PrivateRoutes } from '@/app/router/routes/route-paths';

export function guestLoader() {
  const isAuth = useSession.getState().isAuthenticated();
  if (isAuth) throw redirect(PrivateRoutes.ROOT);
  return null;
}
