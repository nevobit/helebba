import { useQuery } from '@tanstack/react-query';
import { companyContacts, organizationUsers } from '../services';

export function useContactFormOptions() {
  const companiesQuery = useQuery({
    queryKey: ['contacts', 'companies'],
    queryFn: companyContacts,
  });

  const usersQuery = useQuery({
    queryKey: ['organization-users'],
    queryFn: organizationUsers,
  });

  return {
    companies: companiesQuery.data?.items ?? [],
    users: usersQuery.data?.items ?? [],
    isLoadingCompanies: companiesQuery.isLoading,
    isLoadingUsers: usersQuery.isLoading,
  };
}
