import type { CrmPreferences } from '@hlb/contracts';
import { api } from '@/shared/api';

export const crmPreferences = async () => (await api.get<CrmPreferences>('/crm/preferences')).data;

export const saveCrmPreferences = async (
  payload: Pick<CrmPreferences, 'activityTypes' | 'salesTeams'>,
) => (await api.put<CrmPreferences>('/crm/preferences', payload)).data;
