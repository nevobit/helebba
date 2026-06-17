import type { BrandId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export interface InventoryBrand extends PersistedSoftDeletableEntity<BrandId, UserId> {
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  website?: string;
  color?: string;
  position: number;
  parentId: BrandId | null;
}
