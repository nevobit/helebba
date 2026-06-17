import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, DocumentDetail, DocumentsTable, Pagination, Toolbar } from '../../components';
import { getDocumentConfig } from '../../config';
import { useDocumentsListController } from '../../hooks';
import type { DocumentKind, DocumentRow } from '../../types';
import styles from './DocumentList.module.css';

type DocumentListProps = {
  kind: DocumentKind;
};

const getOpenId = (hash: string) => {
  const match = hash.match(/^#open:(.+)$/);
  return match?.[1] ?? null;
};

const DocumentList = ({ kind }: DocumentListProps) => {
  const config = getDocumentConfig(kind);
  const controller = useDocumentsListController(kind);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedId = getOpenId(location.hash);

  const selectedRow = useMemo(
    () => controller.rows.find((row) => row.id === selectedId) ?? null,
    [controller.rows, selectedId],
  );

  const openDocument = (row: DocumentRow) => {
    navigate(`${config.listPath}#open:${row.id}`);
  };

  const editDocument = (row: DocumentRow) => {
    navigate(`${config.listPath}/${row.id}/edit`);
  };

  const closeDocument = () => {
    navigate(config.listPath);
  };

  return (
    <main className={styles.page}>
      <title>{config.title} - Helebba</title>

      <Header config={config} />

      <section className={styles.panel} aria-label={`Listado de ${config.title.toLowerCase()}`}>
        <Toolbar
          paymentMethodId={controller.paymentMethodId}
          paymentMethods={controller.paymentMethods}
          query={controller.query}
          onPaymentMethodChange={controller.changePaymentMethod}
          onQueryChange={controller.changeQuery}
        />

        <DocumentsTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasDocuments={controller.hasDocuments}
          selectedId={selectedId}
          config={config}
          refetch={controller.refetch}
          onEditDocument={editDocument}
          onOpenDocument={openDocument}
        />

        {controller.showPagination && (
          <Pagination
            page={controller.page}
            pageInfo={controller.pageInfo}
            pageSize={controller.pageSize}
            total={controller.total}
            startItem={controller.startItem}
            endItem={controller.endItem}
            onPageChange={controller.setPage}
            onPageSizeChange={controller.changePageSize}
          />
        )}
      </section>

      <DocumentDetail config={config} documentId={selectedId} fallback={selectedRow} onClose={closeDocument} />
    </main>
  );
};

export default DocumentList;
