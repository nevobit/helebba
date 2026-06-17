import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../screens/ProductsList/ProductsList.module.css';
import type { OffsetPageInfo } from '@hlb/contracts';

type CategoriesPaginationProps = {
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
  page,
  pageInfo,
  pageSize,
  total,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange,
}: CategoriesPaginationProps) => (
  <footer className={styles.footer}>
    <span className={styles.pageInfo}>
      <strong>{startItem}</strong> - <strong>{endItem}</strong>({total})
    </span>

    <label className={styles.pageSize}>
      <span>Categorías por página</span>
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
