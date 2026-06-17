import type { CategoryId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export interface Category extends PersistedSoftDeletableEntity<CategoryId, UserId> {
  name: string;
  slug: string;
  description: string;
  type: string;
  color?: string;
  icon?: string;
  options: string[];
  position: number;
  showInCatalog: boolean;
  parentId: CategoryId | null;
}
