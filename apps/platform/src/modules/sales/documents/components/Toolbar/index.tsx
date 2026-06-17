import { Button, TextInput } from '@hlb/design-system';
import type { PaymentMethod } from '@hlb/contracts';
import { CalendarDays, CloudUpload, Search } from 'lucide-react';
import styles from '../../screens/DocumentList/DocumentList.module.css';

type ToolbarProps = {
  paymentMethodId: string;
  paymentMethods: readonly PaymentMethod[];
  query: string;
  onPaymentMethodChange: (value: string) => void;
  onQueryChange: (value: string) => void;
};

export const Toolbar = ({
  onPaymentMethodChange,
  onQueryChange,
  paymentMethodId,
  paymentMethods,
  query,
}: ToolbarProps) => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarLeft}>
      <label className={styles.selectLabel}>
        <span>Estado</span>
        <select defaultValue="all">
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagadas</option>
          <option value="cancelled">Anuladas</option>
        </select>
      </label>

      <label className={styles.selectLabel}>
        <span>Forma de pago</span>
        <select
          value={paymentMethodId}
          onChange={(event) => onPaymentMethodChange(event.target.value)}
        >
          <option value="">Todas las formas de pago</option>
          {paymentMethods.map((paymentMethod) => (
            <option key={String(paymentMethod.id)} value={String(paymentMethod.id)}>
              {paymentMethod.name}
            </option>
          ))}
        </select>
      </label>

      <button className={styles.filterButton} type="button">
        + Filtro
      </button>
    </div>

    <div className={styles.toolbarRight}>
      <TextInput
        className={styles.searchField}
        label="Buscar documento"
        labelHidden
        icon={<Search size={16} />}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <span className={styles.dateRange}>
        <CalendarDays size={15} />
        31/12/2025 - 30/12/2026
      </span>

      <Button
        className={styles.iconButton}
        variant="outline"
        theme="optional"
        size="medium"
        icon={<CloudUpload size={17} />}
        aria-label="Importar documentos"
      />
    </div>
  </div>
);
