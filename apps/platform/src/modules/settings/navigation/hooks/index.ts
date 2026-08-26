import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationNavigation, updateOrganizationNavigation } from '../services';
export const useOrganizationNavigation = () =>
  useQuery({ queryKey: ['organization-navigation'], queryFn: organizationNavigation });
export const useUpdateOrganizationNavigation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateOrganizationNavigation,
    onSuccess: (data) => client.setQueryData(['organization-navigation'], data),
  });
};
