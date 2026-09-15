import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  OrganizationSchemaMongo,
  type Organization,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

export type UpdateOrganizationDetails = Partial<
  Pick<
    Organization,
    | 'legalName'
    | 'taxId'
    | 'email'
    | 'phone'
    | 'website'
    | 'billingAddress'
    | 'billingCity'
    | 'billingPostalCode'
    | 'billingProvince'
    | 'billingCountry'
    | 'country'
    | 'currency'
    | 'numericFormat'
    | 'decimals'
    | 'timezone'
    | 'language'
    | 'dateFormat'
    | 'brandColor'
  >
>;

const stringFields: (keyof Omit<UpdateOrganizationDetails, 'decimals'>)[] = [
  'legalName',
  'taxId',
  'email',
  'phone',
  'website',
  'billingAddress',
  'billingCity',
  'billingPostalCode',
  'billingProvince',
  'billingCountry',
  'country',
  'currency',
  'numericFormat',
  'timezone',
  'language',
  'dateFormat',
  'brandColor',
];

export const updateOrganizationDetails = async ({
  organizationId,
  userId,
  details,
}: {
  organizationId: OrganizationId;
  userId: UserId;
  details: UpdateOrganizationDetails;
}) => {
  const changes: Record<string, string | number | UserId> = { updatedBy: userId };

  for (const field of stringFields) {
    const value = details[field];
    if (value !== undefined) changes[field] = value.trim();
  }

  if (details.legalName !== undefined) {
    const legalName = details.legalName.trim();
    if (!legalName) throw new Error('El nombre de la empresa es obligatorio.');
    changes.legalName = legalName;
    changes.name = legalName;
  }

  if (details.decimals !== undefined) {
    if (!Number.isInteger(details.decimals) || details.decimals < 0 || details.decimals > 6) {
      throw new Error('La cantidad de decimales debe estar entre 0 y 6.');
    }
    changes.decimals = details.decimals;
  }

  const organizationModel = getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );
  const organization = await organizationModel.findOneAndUpdate(
    { _id: organizationId, lifecycleStatus: LifecycleStatus.ACTIVE },
    { $set: changes },
    { new: true, runValidators: true },
  );

  if (!organization) throw new Error('Organización no encontrada.');
  return organization;
};
