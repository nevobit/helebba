import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Boxes,
  ChevronRight,
  Cloud,
  CreditCard,
  FileText,
  Funnel,
  Hash,
  Import,
  Link2,
  Maximize,
  Package,
  PieChart,
  ReceiptText,
  Settings2,
  Store,
  Trash2,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import { useSession } from '@/shared';
import {
  SETTINGS_HOME_HASH,
  SETTINGS_DATA_HASH,
  SETTINGS_CRM_PREFERENCES_HASH,
  SETTINGS_NAVIGATION_HASH,
  SETTINGS_PAYMENT_METHODS_HASH,
  SETTINGS_PRODUCT_FIELDS_HASH,
  SETTINGS_PRODUCT_CONFIGURATION_HASH,
  SETTINGS_USERS_HASH,
  type SettingsCategory,
} from '@/modules/settings/hooks';
import styles from './SettingsCategoryPanel.module.css';

type Item = { title: string; icon: LucideIcon; hash?: string; path?: string };
type CategoryDefinition = {
  title: string;
  description: string;
  icon: LucideIcon;
  items: Item[];
};

const definitions: Record<SettingsCategory, CategoryDefinition> = {
  crm: {
    title: 'CRM',
    description: 'Gestiona tipos de actividad, equipos de venta y campos personalizados.',
    icon: Funnel,
    items: [
      { title: 'Preferencias', icon: UsersRound, hash: SETTINGS_CRM_PREFERENCES_HASH },
      { title: 'Campos personalizados', icon: Settings2, hash: SETTINGS_PRODUCT_FIELDS_HASH },
    ],
  },
  inventory: {
    title: 'Inventario',
    description: 'Ajusta la configuración de productos, stock y almacenes.',
    icon: Boxes,
    items: [
      { title: 'Configuración de productos', icon: Package, hash: SETTINGS_PRODUCT_CONFIGURATION_HASH },
      { title: 'Ajustes de logística', icon: Package, path: '/inventory/warehouses' },
      { title: 'Almacenes', icon: Package, path: '/inventory/warehouses' },
      { title: 'Catálogo B2B', icon: Package, path: '/catalog' },
    ],
  },
  billing: {
    title: 'Facturación',
    description: 'Configura y personaliza numeración, formas de pago, plantillas y más.',
    icon: ReceiptText,
    items: [
      { title: 'Preferencias', icon: Settings2, path: '/sales/revenue' },
      { title: 'Plantillas de documentos', icon: FileText, path: '/sales/revenue' },
      { title: 'Formas de pago', icon: CreditCard, hash: SETTINGS_PAYMENT_METHODS_HASH },
      { title: 'Impuestos', icon: BookOpen, path: '/sales/revenue' },
      { title: 'Conformidad', icon: FileText },
      { title: 'Certificado electrónico', icon: FileText },
    ],
  },
  accounting: {
    title: 'Contabilidad',
    description: 'Define dígitos de cuentas, periodo fiscal y otros datos del ejercicio fiscal.',
    icon: BookOpen,
    items: [
      { title: 'Preferencias', icon: BookOpen, path: '/accounts' },
      { title: 'Asientos y dígitos de cuentas', icon: BookOpen, path: '/accounts' },
      { title: 'Periodo fiscal', icon: BookOpen },
      { title: 'Datos fiscales', icon: BookOpen, hash: SETTINGS_DATA_HASH },
    ],
  },
  projects: {
    title: 'Proyectos',
    description: 'Organiza las tareas por tipo y estados y calcula las tarifas de un proyecto.',
    icon: PieChart,
    items: [
      { title: 'Preferencias', icon: Link2 },
      { title: 'Facturación y presupuestos', icon: Link2 },
    ],
  },
  hr: {
    title: 'RRHH',
    description:
      'Establece políticas y tipos de ausencia y configura la zona privada de empleados.',
    icon: UsersRound,
    items: [
      { title: 'Ausencias', icon: Link2, hash: SETTINGS_USERS_HASH },
      { title: 'Zona del empleado', icon: Link2, hash: SETTINGS_USERS_HASH },
      { title: 'Organización', icon: UsersRound, hash: SETTINGS_USERS_HASH },
    ],
  },
  pos: {
    title: 'TPV',
    description: 'Configura los ajustes del TPV.',
    icon: Store,
    items: [
      { title: 'Preferencias', icon: Store, path: '/pos' },
      { title: 'Preferencias de tienda', icon: Store, path: '/pos' },
    ],
  },
  more: {
    title: 'Más',
    description: 'Decide cómo trabajar con los datos de tu cuenta.',
    icon: Maximize,
    items: [
      { title: 'Importar', icon: Import },
      { title: 'Almacenamiento en la nube', icon: Cloud },
      { title: 'Suscripción', icon: Link2, path: '/trial/expired' },
      { title: 'Gestionar tags', icon: Hash },
      { title: 'Divisas', icon: WalletCards },
      { title: 'Personalizar menú', icon: Settings2, hash: SETTINGS_NAVIGATION_HASH },
      { title: 'Papelera', icon: Trash2 },
    ],
  },
};

type Props = { category: SettingsCategory; onClose: () => void };

export const SettingsCategoryPanel = ({ category, onClose }: Props) => {
  const organization = useSession((state) => state.organization);
  const definition = definitions[category];
  const Icon = definition.icon;
  const navigate = (item: Pick<Item, 'hash' | 'path'>) => {
    if (item.hash) window.location.assign(`#${item.hash}`);
    else if (item.path) window.location.assign(item.path);
  };

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label={`Configuración de ${definition.title}`}>
        <header className={styles.header}>
          <div>
            <span>CONFIGURACIÓN</span>
            <strong>{organization?.name || 'Mi organización'}</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        <main className={styles.content}>
          <button
            type="button"
            className={styles.breadcrumb}
            onClick={() => navigate({ hash: SETTINGS_HOME_HASH })}
          >
            Configuración <ChevronRight size={16} /> <span>{definition.title}</span>
          </button>
          <section className={styles.intro}>
            <span className={styles.introIcon}>
              <Icon size={30} />
            </span>
            <div>
              <h1>{definition.title}</h1>
              <p>{definition.description}</p>
            </div>
          </section>
          <div className={styles.options}>
            {definition.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item)}
                  disabled={!item.hash && !item.path}
                  title={!item.hash && !item.path ? 'Próximamente' : undefined}
                >
                  <span>
                    <ItemIcon size={18} />
                  </span>
                  <strong>{item.title}</strong>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        </main>
      </aside>
    </div>
  );
};
