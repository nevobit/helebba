import type { NavigationItem, OrganizationNavigationItem } from './types';

export function mergeNavigation(
  defaultItems: NavigationItem[],
  customItems: OrganizationNavigationItem[],
): NavigationItem[] {
  const customByItemId = new Map(customItems.map((item) => [item.itemId, item]));

  const mergeItem = (item: NavigationItem): NavigationItem | null => {
    const custom = customByItemId.get(item.id);

    const merged: NavigationItem = {
      ...item,
      name: custom?.name ?? item.name,
      icon: custom?.icon ?? item.icon,
      position: custom?.position ?? item.position,
      isVisible: custom?.isVisible ?? item.isVisible,
      children: item.children
        ?.map(mergeItem)
        .filter((child): child is NavigationItem => Boolean(child)),
    };

    return merged.isVisible ? merged : null;
  };

  return defaultItems
    .map(mergeItem)
    .filter((item): item is NavigationItem => Boolean(item))
    .sort((a, b) => a.position - b.position);
}
