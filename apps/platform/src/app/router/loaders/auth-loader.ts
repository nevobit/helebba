import { useSession } from '@/shared';
import { redirect } from 'react-router-dom';

export function authLoader() {
  const isAuth = useSession.getState().isAuthenticated();
  if (!isAuth) throw redirect('/');
  return null;
}
