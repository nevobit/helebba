import { api } from '@/shared/api';
import type { OrganizationNavigationPreference } from '@hlb/contracts';
export const organizationNavigation = async () =>
  (await api.get<OrganizationNavigationPreference[]>('/me/navigation')).data;
export const updateOrganizationNavigation = async (items: OrganizationNavigationPreference[]) =>
  (await api.put<OrganizationNavigationPreference[]>('/me/navigation', { items })).data;
