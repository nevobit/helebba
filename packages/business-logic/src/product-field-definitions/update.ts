import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductFieldDefinitionSchemaMongo,
  type OrganizationId,
  type ProductFieldDefinition,
  type ProductFieldDefinitionId,
} from '@hlb/contracts';

export const updateProductFieldDefinition = async (
  definitionId: ProductFieldDefinitionId,
  organizationId: OrganizationId,
  data: Partial<ProductFieldDefinition>,
) => {
  const model = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );
  const { organizationId: _organizationId, createdBy: _createdBy, ...safeData } = data;

  return model.findOneAndUpdate(
    { _id: definitionId, organizationId },
    { $set: safeData },
    { new: true, runValidators: true },
  );
};
