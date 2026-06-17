export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  module?: string;
  permissionKey?: string;
  position: number;
  isVisible: boolean;
  isSystem: boolean;
  parentId?: string | null;
  children?: NavigationItem[];
}

export interface OrganizationNavigationItem {
  id: string;
  organizationId: string;

  itemId: string;

  name?: string;
  icon?: string;
  position?: number;
  isVisible?: boolean;

  isCustom: boolean;
  customPath?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
