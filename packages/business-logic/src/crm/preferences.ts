import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CrmPreferencesSchemaMongo,
  type CrmActivityTypePreference,
  type CrmPreferences,
  type CrmSalesTeam,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const preferences = () =>
  getModel<CrmPreferences>(Collection.CRM_PREFERENCES, CrmPreferencesSchemaMongo);

export const defaultCrmActivityTypes = (): CrmActivityTypePreference[] => [
  { id: 'call', name: 'Llamada', color: '#ffc641', icon: 'phone' },
  { id: 'meeting', name: 'Reunión', color: '#41a5ff', icon: 'calendar' },
  { id: 'flight', name: 'Vuelo', color: '#ff4941', icon: 'plane' },
  { id: 'meal', name: 'Comida', color: '#ff7441', icon: 'utensils' },
  { id: 'dinner', name: 'Cena', color: '#9741ff', icon: 'martini' },
];

export const getCrmPreferences = async (organizationId: OrganizationId, userId: UserId) => {
  const existing = await preferences().findOne({ organizationId });
  if (existing) return existing;
  return preferences().create({
    organizationId,
    activityTypes: defaultCrmActivityTypes(),
    salesTeams: [],
    createdBy: userId,
    updatedBy: userId,
  });
};

const cleanActivityTypes = (items: CrmActivityTypePreference[]) => {
  if (!Array.isArray(items) || items.length === 0)
    throw new Error('Debes conservar al menos un tipo de actividad.');
  return items.map((item) => {
    const name = item.name?.trim();
    if (!name) throw new Error('Todos los tipos de actividad deben tener un nombre.');
    if (!/^#[0-9a-f]{6}$/i.test(item.color)) throw new Error(`El color de “${name}” no es válido.`);
    return {
      id: item.id || randomUUID(),
      name,
      color: item.color.toLowerCase(),
      icon: item.icon || 'calendar',
    };
  });
};

const cleanTeams = (items: CrmSalesTeam[]) =>
  (Array.isArray(items) ? items : []).map((item) => {
    const name = item.name?.trim();
    if (!name) throw new Error('Todos los equipos deben tener un nombre.');
    if (!/^#[0-9a-f]{6}$/i.test(item.color)) throw new Error(`El color de “${name}” no es válido.`);
    return {
      id: item.id || randomUUID(),
      name,
      color: item.color.toLowerCase(),
      icon: item.icon || 'users',
      leaderId: item.leaderId || undefined,
      members: [...new Set(item.members ?? [])],
    };
  });

export const updateCrmPreferences = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: Pick<CrmPreferences, 'activityTypes' | 'salesTeams'>,
) => {
  await getCrmPreferences(organizationId, userId);
  return preferences().findOneAndUpdate(
    { organizationId },
    {
      $set: {
        activityTypes: cleanActivityTypes(input.activityTypes),
        salesTeams: cleanTeams(input.salesTeams),
        updatedBy: userId,
      },
    },
    { new: true, runValidators: true },
  );
};
