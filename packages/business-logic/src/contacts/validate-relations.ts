import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ContactGroupSchemaMongo,
  ContactTagSchemaMongo,
  LifecycleStatus,
  type Contact,
  type ContactGroup,
  type ContactTag,
} from '@hlb/contracts';

export const validateContactRelations = async (data: Partial<Contact>) => {
  const organizationId = data.organizationId;
  if (!organizationId) throw new Error('La organización es obligatoria.');

  if (data.groupId) {
    const exists = await getModel<ContactGroup>(
      Collection.CONTACT_GROUPS,
      ContactGroupSchemaMongo,
    ).exists({
      _id: data.groupId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    });
    if (!exists) throw new Error('El grupo de contactos seleccionado no existe.');
  }

  if (data.tags?.length) {
    const tagModel = getModel<ContactTag>(Collection.CONTACT_TAGS, ContactTagSchemaMongo);
    const tags = [...new Set(data.tags.filter(Boolean))];
    const existing = await tagModel.find({
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      $or: [{ _id: { $in: tags } }, { name: { $in: tags } }],
    });
    if (existing.length !== tags.length) {
      throw new Error('Una o más etiquetas seleccionadas no existen.');
    }
  }
};
