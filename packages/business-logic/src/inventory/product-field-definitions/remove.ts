import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  ProductFieldDefinitionSchemaMongo,
  type OrganizationId,
  type ProductFieldDefinition,
  type ProductFieldDefinitionId,
  type UserId,
} from '@hlb/contracts';

export const removeProductFieldDefinition = async (
  definitionId: ProductFieldDefinitionId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const model = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );

  return model.findOneAndUpdate(
    { _id: definitionId, organizationId },
    {
      $set: {
        active: false,
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
    { new: true },
  );
};
