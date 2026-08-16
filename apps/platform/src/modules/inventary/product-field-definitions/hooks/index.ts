import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductFieldDefinitionId } from '@hlb/contracts';
import {
  createProductFieldDefinition,
  productFieldDefinitions,
  removeProductFieldDefinition,
  updateProductFieldDefinition,
  type ProductFieldDefinitionListParams,
  type ProductFieldDefinitionPayload,
} from '../services';

export const useProductFieldDefinitions = (params: ProductFieldDefinitionListParams = {}) => {
  const query = useQuery({
    queryKey: ['product-field-definitions', params],
    queryFn: () => productFieldDefinitions(params),
  });

  return {
    definitions: query.data ?? [],
    isLoadingDefinitions: query.isLoading,
    definitionsError: query.error,
  };
};

export const useProductFieldDefinitionMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['product-field-definitions'] });
  const createMutation = useMutation({ mutationFn: createProductFieldDefinition, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: ProductFieldDefinitionId; payload: ProductFieldDefinitionPayload }) =>
      updateProductFieldDefinition(id, payload),
    onSuccess: invalidate,
  });
  const removeMutation = useMutation({ mutationFn: removeProductFieldDefinition, onSuccess: invalidate });

  return {
    createDefinitionAsync: createMutation.mutateAsync,
    updateDefinitionAsync: updateMutation.mutateAsync,
    removeDefinitionAsync: removeMutation.mutateAsync,
    isSavingDefinition: createMutation.isPending || updateMutation.isPending || removeMutation.isPending,
  };
};
