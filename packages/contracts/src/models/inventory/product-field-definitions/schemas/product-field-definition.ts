import type {
  CategoryId,
  PersistedSoftDeletableEntity,
  ProductFieldDefinitionId,
  UserId,
} from '../../../../common';

export const ProductFieldType = {
  Text: 'text',
  LongText: 'long-text',
  Number: 'number',
  Boolean: 'boolean',
  Select: 'select',
  MultiSelect: 'multi-select',
  Date: 'date',
} as const;

export type ProductFieldType = (typeof ProductFieldType)[keyof typeof ProductFieldType];
export type ProductFieldValue = string | number | boolean | string[] | null;

export interface ProductFieldOption {
  label: string;
  value: string;
}

export interface ProductFieldDefinition
  extends PersistedSoftDeletableEntity<ProductFieldDefinitionId, UserId> {
  key: string;
  label: string;
  type: ProductFieldType;
  target: 'product' | 'variant';
  required: boolean;
  active: boolean;
  order: number;
  appliesTo: 'all' | 'categories';
  categoryIds: CategoryId[];
  options: ProductFieldOption[];
  defaultValue: ProductFieldValue;
}
