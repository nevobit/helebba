import { useMemo } from 'react';
import { mergeNavigation } from '../merge-navigation';
import { defaultNavigation } from '../default-navigation';
import type { NavigationItem } from '../types';

export function useNavigationItems() {
  //   const { items: customItems = [], isLoading } = useOrganizationNavigation();

  const customItems: NavigationItem | [] = [];
  const isLoading = false;

  const items = useMemo(() => {
    return mergeNavigation(defaultNavigation, customItems);
  }, [customItems]);

  return {
    items,
    isLoading,
  };
}
