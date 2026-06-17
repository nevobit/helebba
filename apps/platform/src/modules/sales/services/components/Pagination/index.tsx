import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { OffsetPageInfo } from '@hlb/contracts';
import styles from '../../screens/ServicesList/ServicesList.module.css';

type ServicesPaginationProps = {
  page: number;
  pageInfo?: OffsetPageInfo;
  pageSize: number;
  total: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const Pagination = ({
  endItem,
  onPageChange,
  onPageSizeChange,
  page,
  pageInfo,
  pageSize,
  startItem,
  total,
}: ServicesPaginationProps) => (
  <footer className={styles.footer}>
    <span className={styles.pageInfo}>
      <strong>{startItem}</strong> - <strong>{endItem}</strong>({total})
    </span>

    <label className={styles.pageSize}>
      <span>Servicios por página</span>
      <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </label>

    <div className={styles.pagination}>
      <button
        type="button"
        aria-label="Página anterior"
        disabled={!pageInfo?.hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      <strong>{page}</strong>
      <button
        type="button"
        aria-label="Página siguiente"
        disabled={!pageInfo?.hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </footer>
);
