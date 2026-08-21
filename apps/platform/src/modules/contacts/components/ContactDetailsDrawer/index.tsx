import { useEffect, useMemo } from 'react';
import { Menus } from '@hlb/design-system';
import type { Document } from '@hlb/contracts';
import { StatusDocument } from '@hlb/contracts/constants';
import {
  ArrowRight,
  Building2,
  Calendar,
  Edit3,
  Eraser,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Send,
  ShoppingCart,
} from 'lucide-react';
import { useDocuments } from '@/modules/sales/documents/hooks';
import type { ContactRow } from '../../types';
import styles from './ContactDetailsDrawer.module.css';

type ContactDetailsDrawerProps = {
  contact: ContactRow | null;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete?: (contact: ContactRow) => void;
  onEdit?: (contact: ContactRow) => void;
  onViewDetail?: (contact: ContactRow) => void;
};

type InfoRow = {
  label: string;
  value: string;
};

const getDisplayName = (contact: ContactRow) => {
  if (!contact.tradeName || contact.tradeName === contact.name) return contact.name;

  return `${contact.tradeName} (${contact.name})`;
};

const getAddress = (contact: ContactRow) =>
  [contact.address, contact.city, contact.postalCode, contact.department, contact.countryCode]
    .filter(Boolean)
    .join(' ');

const createItems = [
  { label: 'Nota', icon: Edit3 },
  { label: 'Presupuesto', icon: Eraser },
  { label: 'Factura', icon: Send },
  { label: 'Actividad', icon: Calendar },
  { label: 'Envío', icon: Edit3 },
  { label: 'Compra', icon: ShoppingCart },
];

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (value: number) => `${moneyFormatter.format(Number.isFinite(value) ? value : 0)} CO$`;

type Metrics = {
  total: number;
  count: number;
  average: number;
  frequency: number;
  pending: number;
};

const computeMetrics = (documents: readonly Document[]): Metrics => {
  const active = documents.filter((document) => Number(document.status) !== StatusDocument.Cancelled);
  const total = active.reduce((sum, document) => sum + (Number(document.total) || 0), 0);
  const count = active.length;
  const average = count > 0 ? total / count : 0;
  const pending = active.reduce((sum, document) => sum + (Number(document.paymentsPending) || 0), 0);
  const dates = active
    .map((document) => new Date(document.date).getTime())
    .filter((time) => Number.isFinite(time))
    .sort((a, b) => a - b);
  let frequency = 0;
  if (dates.length > 1) {
    const diffs = dates.slice(1).map((time, index) => time - dates[index]);
    frequency = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length / (1000 * 60 * 60 * 24);
  }

  return { total, count, average, frequency: Math.round(frequency), pending };
};

const MetricGroup = ({
  title,
  purchase = false,
  metrics,
}: {
  title: string;
  purchase?: boolean;
  metrics: Metrics;
}) => (
  <section className={styles.section}>
    <h3>{title}</h3>
    <div className={styles.metrics}>
      <div>
        <strong>{money(metrics.total)}</strong>
        <button type="button">
          {metrics.count} {metrics.count === 1 ? 'factura' : 'facturas'}
        </button>
      </div>
      <div>
        <strong>{money(metrics.average)}</strong>
        <span>{purchase ? 'Promedio/compra' : 'Promedio/venta'}</span>
      </div>
      <div>
        <strong>{metrics.frequency} días</strong>
        <span>Frec. media</span>
      </div>
      <div>
        <strong>{money(metrics.pending)}</strong>
        <span>{purchase ? 'Pend. pago' : 'Pend. cobro'}</span>
      </div>
    </div>
  </section>
);

export const ContactDetailsDrawer = ({
  contact,
  isDeleting = false,
  onClose,
  onDelete,
  onEdit,
  onViewDetail,
}: ContactDetailsDrawerProps) => {
  useEffect(() => {
    if (!contact) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [contact, onClose]);

  const { documents: invoices } = useDocuments('invoice', {
    page: 1,
    limit: 1000,
    contactId: contact?.id ? String(contact.id) : undefined,
  });
  const { documents: purchases } = useDocuments('purchase', {
    page: 1,
    limit: 1000,
    contactId: contact?.id ? String(contact.id) : undefined,
  });
  const salesMetrics = useMemo(() => computeMetrics(invoices), [invoices]);
  const purchaseMetrics = useMemo(() => computeMetrics(purchases), [purchases]);

  if (!contact) return null;

  const infoRows: InfoRow[] = [
    { label: 'Correo electrónico', value: contact.email },
    { label: 'Teléfono', value: contact.mobile || contact.phone },
    { label: 'Dirección', value: getAddress(contact) },
    { label: 'Página web', value: contact.website },
  ].filter((row) => row.value);

  if (infoRows.length === 0 && contact.countryCode) {
    infoRows.push({ label: 'Dirección', value: contact.countryCode });
  }

  const hasPurchases = contact.kind !== 'Cliente';
  const quickActions = [
    { label: 'Correo electrónico', icon: Mail, isEnabled: Boolean(contact.email) },
    { label: 'Llamada', icon: Phone, isEnabled: Boolean(contact.phone || contact.mobile) },
    { label: 'WhatsApp', icon: Phone, isEnabled: Boolean(contact.phone || contact.mobile) },
    { label: 'Web', icon: Globe2, isEnabled: Boolean(contact.website) },
    { label: 'Mapa', icon: MapPin, isEnabled: Boolean(getAddress(contact)) },
  ];

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <aside
        className={styles.drawer}
        aria-label={`Detalle de ${contact.name}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.avatar} aria-hidden="true">
            <Building2 size={30} strokeWidth={1.7} />
          </div>
          <div className={styles.titleBlock}>
            <div className={styles.titleLine}>
              <h2>{getDisplayName(contact)}</h2>
              {contact.kind && <span>{contact.kind}</span>}
            </div>
            {contact.code && <p>Número de identificación: {contact.code}</p>}
          </div>
          <Menus defaultPlacement="bottom-end">
            <Menus.Menu>
              <Menus.Toggle
                id={`contact-actions-${contact.id}`}
                className={styles.menuToggle}
                verticalIcon
                aria-label="Más acciones"
              />
              <Menus.List id={`contact-actions-${contact.id}`} placement="bottom-end">
                <Menus.Item id={`edit-${contact.id}`} onClick={() => onEdit?.(contact)}>
                  Editar
                </Menus.Item>
                <Menus.Item id={`delete-${contact.id}`} onClick={() => onDelete?.(contact)}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Menus.Item>
                <Menus.Item id={`close-${contact.id}`} onClick={onClose}>
                  Cerrar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
        </header>

        <nav className={styles.quickActions} aria-label="Acciones rápidas">
          {quickActions.map(({ icon: Icon, isEnabled, label }) => (
            <button key={label} type="button" disabled={!isEnabled}>
              <span>
                <Icon size={22} strokeWidth="1.5px" />
              </span>
              {label}
            </button>
          ))}
          <button type="button" className={styles.moreAction} onClick={() => onViewDetail?.(contact)}>
            <span>
              <ArrowRight size={26} strokeWidth="1.5px" />
            </span>
            Más
          </button>
        </nav>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Información del contacto</h3>
            <button type="button" onClick={() => onEdit?.(contact)}>
              Editar
            </button>
          </div>
          <div className={styles.infoCard}>
            {infoRows.length > 0 ? (
              infoRows.map((row) => (
                <div key={row.label} className={styles.infoRow}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))
            ) : (
              <div className={styles.infoRow}>
                <span>Información</span>
                <strong>Sin datos adicionales</strong>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3>Crear nuevo</h3>
          <div className={styles.createGrid}>
            {createItems
              .filter((item) => hasPurchases || item.label !== 'Compra')
              .map(({ icon: Icon, label }) => (
                <button key={label} type="button">
                  <Icon size={16} strokeWidth="1.5px" />
                  {label}
                </button>
              ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3>Empresas</h3>
          <button type="button" className={styles.relateCompany}>
            <span>
              <Plus size={15} strokeWidth={2.2} />
            </span>
            Relacionar empresa
          </button>
        </section>

        <MetricGroup title="Ventas" metrics={salesMetrics} />
        {hasPurchases && <MetricGroup title="Compras" purchase metrics={purchaseMetrics} />}
      </aside>
    </div>
  );
};
