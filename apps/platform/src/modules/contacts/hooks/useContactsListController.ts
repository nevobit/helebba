import { useMemo, useState } from 'react';
import type { ContactScope } from '../services';
import { useContacts } from './useContacts';
import { toContactRow } from '../mappers';

export const useContactsListController = () => {
  const [activeScope, setActiveScope] = useState<ContactScope>('all');
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);

  const { contacts, error, isLoading, pageInfo, refetch, total } = useContacts({
    page,
    limit: pageSize,
    search: query,
    scope: activeScope,
  });

  const rows = useMemo(() => contacts.map(toContactRow), [contacts]);

  const hasContacts = rows.length > 0;

  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = total > 0 ? startItem + rows.length - 1 : 0;

  const changeScope = (scope: ContactScope) => {
    setActiveScope(scope);
    setPage(1);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    activeScope,
    query,
    page,
    pageSize,
    rows,
    error,
    isLoading,
    pageInfo,
    refetch,
    total,
    hasContacts,
    startItem,
    endItem,
    showPagination: hasContacts || isLoading,
    setPage,
    changeScope,
    changeQuery,
    changePageSize,
  };
};
