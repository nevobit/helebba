import { useMemo, useState } from 'react';
import { usePaymentMethods } from '@/modules/settings/payment-methods/hooks';
import { toDocumentRow } from '../mappers';
import type { DocumentKind } from '../types';
import { useDocuments } from './useDocuments';

export const useDocumentsListController = (kind: DocumentKind) => {
  const [query, setQuery] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);

  const { documents, error, isLoading, pageInfo, refetch, total } = useDocuments(kind, {
    page,
    limit: pageSize,
    paymentMethodId,
    search: query,
  });
  const { isLoading: isLoadingPaymentMethods, paymentMethods } = usePaymentMethods({ page: 1, limit: 100 });

  const paymentMethodNamesById = useMemo(
    () => new Map(paymentMethods.map((paymentMethod) => [String(paymentMethod.id), paymentMethod.name])),
    [paymentMethods],
  );
  const rows = useMemo(
    () => documents.map((document) => toDocumentRow(document, paymentMethodNamesById)),
    [documents, paymentMethodNamesById],
  );
  const hasDocuments = rows.length > 0;
  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = total > 0 ? startItem + rows.length - 1 : 0;

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const changePaymentMethod = (value: string) => {
    setPaymentMethodId(value);
    setPage(1);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    query,
    paymentMethodId,
    paymentMethods,
    page,
    pageSize,
    rows,
    error,
    isLoading: isLoading || isLoadingPaymentMethods,
    pageInfo,
    refetch,
    total,
    hasDocuments,
    startItem,
    endItem,
    showPagination: hasDocuments || isLoading || isLoadingPaymentMethods,
    setPage,
    changeQuery,
    changePaymentMethod,
    changePageSize,
  };
};
