import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crmPreferences, saveCrmPreferences } from '../services';

export const useCrmPreferences = () =>
  useQuery({ queryKey: ['crm-preferences'], queryFn: crmPreferences });

export const useSaveCrmPreferences = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveCrmPreferences,
    onSuccess: (data) => client.setQueryData(['crm-preferences'], data),
  });
};
