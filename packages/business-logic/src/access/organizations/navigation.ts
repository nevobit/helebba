import { Collection, getModel } from '@hlb/constant-definitions';
import {
  OrganizationSchemaMongo,
  type Organization,
  type OrganizationId,
  type OrganizationNavigationPreference,
  type UserId,
} from '@hlb/contracts';

const organizations = () =>
  getModel<Organization>(Collection.ORGANIZATIONS, OrganizationSchemaMongo);
export const getOrganizationNavigation = async (organizationId: OrganizationId) => {
  const organization = await organizations()
    .findById(organizationId)
    .select({ navigationPreferences: 1 });
  if (!organization) throw new Error('Organización no encontrada.');
  return organization.navigationPreferences ?? [];
};
export const updateOrganizationNavigation = async (
  organizationId: OrganizationId,
  userId: UserId,
  preferences: OrganizationNavigationPreference[],
) => {
  const normalized = [
    ...new Map(
      preferences
        .filter((item) => item.itemId?.trim())
        .map((item) => [
          item.itemId,
          {
            itemId: item.itemId.trim(),
            isVisible: Boolean(item.isVisible),
            position: item.position,
            name: item.name,
            icon: item.icon,
          },
        ]),
    ).values(),
  ];
  const organization = await organizations()
    .findByIdAndUpdate(
      organizationId,
      { $set: { navigationPreferences: normalized, updatedBy: userId } },
      { new: true, runValidators: true },
    )
    .select({ navigationPreferences: 1 });
  if (!organization) throw new Error('Organización no encontrada.');
  return organization.navigationPreferences ?? [];
};
