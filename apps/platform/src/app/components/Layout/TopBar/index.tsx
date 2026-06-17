import { useQuery } from '@tanstack/react-query';
import styles from './TopBar.module.css';
import { api } from '@/shared/api';
import { LineScaleLoader } from '@hlb/design-system';
import type { Subscription } from '@hlb/contracts';

export const subscription = async () => {
  const { data } = await api.get('/subscriptions/current');

  return data;
};

function getTrialInfo(subscription?: Subscription | null) {
  if (!subscription?.trialStartedAt || !subscription?.trialEndsAt) {
    return {
      totalDays: 0,
      usedDays: 0,
      remainingDays: 0,
      progress: 0,
    };
  }

  const startedAt = new Date(subscription.trialStartedAt);
  const endsAt = new Date(subscription.trialEndsAt);
  const now = new Date();

  const totalMs = endsAt.getTime() - startedAt.getTime();
  const usedMs = now.getTime() - startedAt.getTime();
  const remainingMs = endsAt.getTime() - now.getTime();

  const totalDays = Math.max(1, Math.ceil(totalMs / 86_400_000));
  const usedDays = Math.min(totalDays, Math.max(0, Math.floor(usedMs / 86_400_000)));
  const remainingDays = Math.max(0, Math.ceil(remainingMs / 86_400_000));

  return {
    totalDays,
    usedDays,
    remainingDays,
    progress: Math.min(100, Math.max(0, (usedDays / totalDays) * 100)),
  };
}

function TopBar() {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscription,
  });

  if (isLoading || !data || data.status !== 'trialing') {
    return <LineScaleLoader />;
  }

  const trial = getTrialInfo(data);

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <span className={styles.days}>
          {trial.usedDays} / {trial.totalDays} días
        </span>

        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${trial.progress}%` }} />
        </div>

        <span className={styles.divider} />

        <span className={styles.message}>
          Te quedan {trial.remainingDays} días de tu prueba gratuita
        </span>
      </div>

      <div className={styles.actions}>
        <a href="#" className={styles.link}>
          Ver tutoriales
        </a>

        <button className={styles.discountButton}>-50% 3 MESES</button>

        <button className={styles.plansButton}>Ver planes</button>
      </div>
    </div>
  );
}

export default TopBar;
