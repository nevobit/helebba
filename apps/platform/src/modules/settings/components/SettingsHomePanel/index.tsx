import { useMemo, useState } from 'react';
import {
  BookOpen,
  Boxes,
  CalendarDays,
  Code2,
  CreditCard,
  Funnel,
  Maximize,
  PieChart,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useSession } from '@/shared';
import {
  SETTINGS_ACCOUNT_HASH,
  SETTINGS_CATEGORY_HASHES,
  SETTINGS_DEVELOPER_CREDENTIALS_HASH,
} from '@/modules/settings/hooks';
import styles from './SettingsHomePanel.module.css';

type Props = { onClose: () => void };
const sections = [
  {
    title: 'Cuenta',
    description: 'Personaliza tu cuenta, invita usuarios y configura el envío de correos.',
    icon: UserRound,
    hash: SETTINGS_ACCOUNT_HASH,
  },
  {
    title: 'Facturación',
    description: 'Configura y personaliza numeración, formas de pago, plantillas y más.',
    icon: CreditCard,
    hash: SETTINGS_CATEGORY_HASHES.billing,
  },
  {
    title: 'Contabilidad',
    description: 'Define dígitos de cuentas, periodo fiscal y otros datos del ejercicio fiscal.',
    icon: BookOpen,
    hash: SETTINGS_CATEGORY_HASHES.accounting,
  },
  {
    title: 'Proyectos',
    description: 'Organiza las tareas por tipo y estados y calcula las tarifas de un proyecto.',
    icon: PieChart,
    hash: SETTINGS_CATEGORY_HASHES.projects,
  },
  {
    title: 'CRM',
    description: 'Gestiona tipos de actividad, equipos de venta y campos personalizados.',
    icon: Funnel,
    hash: SETTINGS_CATEGORY_HASHES.crm,
  },
  {
    title: 'RRHH',
    description: 'Establece políticas, usuarios y configura la zona privada de empleados.',
    icon: UsersRound,
    hash: SETTINGS_CATEGORY_HASHES.hr,
  },
  {
    title: 'Inventario',
    description: 'Ajusta la configuración de productos, stock y almacenes.',
    icon: Boxes,
    hash: SETTINGS_CATEGORY_HASHES.inventory,
  },
  {
    title: 'TPV',
    description: 'Configura los ajustes del punto de venta.',
    icon: CalendarDays,
    hash: SETTINGS_CATEGORY_HASHES.pos,
  },
  {
    title: 'Desarrolladores',
    description: 'Documentación y credenciales de la API.',
    icon: Code2,
    hash: SETTINGS_DEVELOPER_CREDENTIALS_HASH,
  },
  {
    title: 'Más',
    description: 'Decide cómo trabajar con los datos y el menú de tu cuenta.',
    icon: Maximize,
    hash: SETTINGS_CATEGORY_HASHES.more,
  },
];

export const SettingsHomePanel = ({ onClose }: Props) => {
  const organization = useSession((state) => state.organization);
  const [search, setSearch] = useState('');
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? sections.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query))
      : sections;
  }, [search]);
  const navigate = (hash: string) => {
    window.location.assign(`#${hash}`);
  };

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Configuración">
        <header className={styles.header}>
          <div>
            <span>CONFIGURACIÓN</span>
            <strong>{organization?.name || 'Mi organización'}</strong>
          </div>
          <label className={styles.search}>
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar en ajustes..."
              autoFocus
            />
          </label>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        <div className={styles.content}>
          <section className={styles.trial}>
            <span className={styles.trialIcon}>
              <CalendarDays size={22} />
            </span>
            <div>
              <strong>Estás en modo de prueba</strong>
              <span>Consulta el tiempo restante de tu prueba gratuita</span>
            </div>
            <button type="button">Ver planes</button>
            <span className={styles.progress}>
              <i />
            </span>
          </section>
          <div className={styles.grid}>
            {visible.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  className={styles.section}
                  onClick={() => navigate(item.hash)}
                >
                  <span className={styles.sectionIcon}>
                    <Icon size={24} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
          {visible.length === 0 && (
            <p className={styles.empty}>No encontramos ajustes para “{search}”.</p>
          )}
        </div>
      </aside>
    </div>
  );
};
