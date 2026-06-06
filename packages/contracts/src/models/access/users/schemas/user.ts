import type { GroupId, PersistedSoftDeletableEntity, ProductId } from '../../../../common';

export interface User extends PersistedSoftDeletableEntity<ProductId> {
  customId: string;
  name: string;
  code: string;
  varnumber: string;
  tradeName: string;
  email: string;
  mobile: string;
  phone: string;
  type: string;
  iban: string;
  swift: string;
  groupId: GroupId;
  clientRecord: string;
  isPerson: boolean;
}
