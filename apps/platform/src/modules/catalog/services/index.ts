import { api } from '@/shared/api';
import type { Catalog, OffsetPaginatedResult } from '@hlb/contracts';
export type CatalogPayload = Partial<Pick<Catalog, 'name' | 'active' | 'selectionMode' | 'productIds' | 'sortOrder' | 'settings'>>;
export const catalogs = async (search = '') => (await api.get<OffsetPaginatedResult<Catalog>>('/catalogs', { params: { page: 1, limit: 100, search: search || undefined } })).data;
export const createCatalog = async (payload: CatalogPayload) => (await api.post<Catalog>('/catalogs', payload)).data;
export const updateCatalog = async (id: string, payload: CatalogPayload) => (await api.patch<Catalog>(`/catalogs/${id}`, payload)).data;
export const deleteCatalog = async (id: string) => (await api.delete<boolean>(`/catalogs/${id}`)).data;
