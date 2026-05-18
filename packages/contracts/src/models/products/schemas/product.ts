import {
  PersistedSoftDeletableEntity,
  UserId,
  CategoryId,
  ContactId,
  ProductId,
} from '../../../common';

export interface Product extends PersistedSoftDeletableEntity<ProductId, UserId> {
  kind: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  typeId: string;
  inCatalog: boolean;
  images: string[];
  contactId: ContactId;
  contactName: string;
  price: number;
  cost: number;
  taxes: string[];
  total: number;
  hasStock: boolean;
  stock: number;
  barcode: string;
  sku: string;
  purchasePrice: number;
  weight: number;
  tags: string[];
  categoryId: CategoryId;
  categories: string[];
  cateogryOpyions: string;
  factoryCode: string;
}
