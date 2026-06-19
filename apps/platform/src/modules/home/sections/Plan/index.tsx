import { subscription } from '@/app/components/Layout/TopBar';
import { Button } from '@hlb/design-system';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import styles from './Plan.module.css';

const Plan = () => {
  const { data } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscription,
  });
  return (
    <div>
      {data?.status == 'trialing' && (
        <div className={`${styles.panel_home} ${styles.trial_panel}`}>
          <span>Periodo de prueba</span>

          <h3>Elige tu plan ahora y obtén 50% de descuento</h3>
          <p>
            Entendemos que conocernos lleva tiempo, por eso te hacemos un descuento especial para
            que descubras todo nuestro potencial
          </p>

          <div className={styles.tags}>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> Facturación
            </span>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> Contabilidad
            </span>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> Inventario
            </span>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> Banca
            </span>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> CRM
            </span>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> Recursos Humanos
            </span>
            <span>
              <Lock size={16} strokeWidth="1.5px" color="rgba(0,0,0,0.6)" /> Proyectos
            </span>
          </div>

          <Button>Elije tu plan</Button>
        </div>
      )}
    </div>
  );
};

export default Plan;
