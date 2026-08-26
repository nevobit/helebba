import { useMemo } from 'react';
import { mergeNavigation } from '../merge-navigation';
import { defaultNavigation } from '../default-navigation';
import { useOrganizationNavigation } from '@/modules/settings/navigation/hooks';

export function useNavigationItems() {
  const { data: customItems = [], isLoading } = useOrganizationNavigation();

  const items = useMemo(() => {
    return mergeNavigation(defaultNavigation, customItems);
  }, [customItems]);

  return {
    items,
    isLoading,
  };
}
