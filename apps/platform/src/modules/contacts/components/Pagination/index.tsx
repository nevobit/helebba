import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../screens/ContactsList/ContactsList.module.css';

type PageInfo = {
  page?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

type ContactsPaginationProps = {
  page: number;
  pageInfo?: PageInfo;
  pageSize: number;
  total: number;
  startItem: number;
  endItem: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
  onPageSizeChange: (value: number) => void;
};

export const Pagination = ({
  page,
  pageInfo,
  pageSize,
  total,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange,
}: ContactsPaginationProps) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.pageInfo}>
        <strong>{`${startItem} - ${endItem}`}</strong>
        <span>({total})</span>
      </div>

      <label className={styles.pageSize}>
        <span>Filas por página</span>

        <select
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>

      <nav className={styles.pagination} aria-label="Paginación">
        <button
          type="button"
          disabled={!pageInfo?.hasPreviousPage}
          aria-label="Página anterior"
          onClick={() => onPageChange((current) => Math.max(current - 1, 1))}
        >
          <ChevronLeft size={16} />
        </button>

        <strong>{pageInfo?.page ?? page}</strong>

        <button
          type="button"
          disabled={!pageInfo?.hasNextPage}
          aria-label="Página siguiente"
          onClick={() => onPageChange((current) => current + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </footer>
  );
};
