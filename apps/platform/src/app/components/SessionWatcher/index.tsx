import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import { queryClient } from '@/app/providers';
import { PublicRoutes } from '@/app/router/routes/route-paths';
import { refreshSession } from '@/modules/auth/services';
import { useSession } from '@/shared';

const publicPaths = new Set(Object.values(PublicRoutes));

export const SessionWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSession((state) => state.status);
  const accessExp = useSession((state) => state.accessExp);
  const token = useSession((state) => state.token);

  useEffect(() => {
    if (status !== 'unauth') return;
    if (publicPaths.has(location.pathname as (typeof PublicRoutes)[keyof typeof PublicRoutes]))
      return;

    queryClient.clear();
    localforage.removeItem('rq-cache').catch(() => undefined);
    navigate(PublicRoutes.LOGIN, { replace: true });
  }, [location.pathname, navigate, status]);

  useEffect(() => {
    if (!token || !accessExp) return;

    const expiresAt = new Date(accessExp).getTime();
    if (Number.isNaN(expiresAt)) return;

    const delay = expiresAt - Date.now() - 60_000;
    if (delay <= 0) return;

    const timeoutId = setTimeout(async () => {
      const { refreshToken } = useSession.getState();
      if (!refreshToken) return;

      try {
        const data = await refreshSession(refreshToken);
        useSession.getState().setSessionTokens({
          token: data.token,
          refreshToken: data.refreshToken,
          accessExp: data.expiresAt,
        });
      } catch {
        useSession.getState().signOut();
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [accessExp, token]);

  return null;
};