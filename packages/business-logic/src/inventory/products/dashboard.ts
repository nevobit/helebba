import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  DocumentType,
  LifecycleStatus,
  ProductSchemaMongo,
  type Document,
  type OrganizationId,
  type Product,
} from '@hlb/contracts';

export type InventoryDashboardOrder = {
  units: number;
  total: number;
};

export type InventoryDashboard = {
  productUnits: number;
  stockValue: number;
  averageCost: number;
  orders: {
    sales: InventoryDashboardOrder;
    purchases: InventoryDashboardOrder;
    manufacturing: InventoryDashboardOrder;
    salesDeliveryNotes: InventoryDashboardOrder;
    purchaseDeliveryNotes: InventoryDashboardOrder;
  };
};

const emptyOrder = (): InventoryDashboardOrder => ({ units: 0, total: 0 });

export const getInventoryDashboard = async (
  organizationId: OrganizationId,
): Promise<InventoryDashboard> => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [stockRows, documentRows] = await Promise.all([
    getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).aggregate<{
      productUnits: number;
      stockValue: number;
      trackedProducts: number;
      totalCost: number;
    }>([
      {
        $match: {
          organizationId,
          lifecycleStatus: { $ne: LifecycleStatus.DELETED },
          hasStock: true,
        },
      },
      {
        $project: {
          stock: { $ifNull: ['$stock', 0] },
          unitCost: {
            $ifNull: ['$cost', { $ifNull: ['$purchasePrice', 0] }],
          },
        },
      },
      {
        $group: {
          _id: null,
          productUnits: { $sum: '$stock' },
          stockValue: { $sum: { $multiply: ['$stock', '$unitCost'] } },
          trackedProducts: { $sum: 1 },
          totalCost: { $sum: '$unitCost' },
        },
      },
    ]),
    getModel<Document>(Collection.DOCUMENTS, DocumentSchemaMongo).aggregate<{
      _id: string;
      units: number;
      total: number;
    }>([
      {
        $match: {
          organizationId,
          lifecycleStatus: LifecycleStatus.ACTIVE,
          createdAt: { $gte: since },
          docType: {
            $in: [
              DocumentType.SALES_ORDER,
              DocumentType.PURCHASE_ORDER,
              DocumentType.WAYBILL,
              DocumentType.REFERRALS,
            ],
          },
        },
      },
      {
        $project: {
          docType: 1,
          total: { $ifNull: ['$total', 0] },
          units: {
            $sum: {
              $map: {
                input: { $ifNull: ['$lines', []] },
                as: 'line',
                in: { $ifNull: ['$$line.units', { $ifNull: ['$$line.quantity', 0] }] },
              },
            },
          },
        },
      },
      { $group: { _id: '$docType', units: { $sum: '$units' }, total: { $sum: '$total' } } },
    ]),
  ]);

  const stock = stockRows[0];
  const documents = new Map(documentRows.map((row) => [row._id, row]));
  const order = (type: string) => {
    const value = documents.get(type);
    return value ? { units: value.units, total: value.total } : emptyOrder();
  };

  return {
    productUnits: stock?.productUnits ?? 0,
    stockValue: stock?.stockValue ?? 0,
    averageCost: stock?.trackedProducts ? stock.totalCost / stock.trackedProducts : 0,
    orders: {
      sales: order(DocumentType.SALES_ORDER),
      purchases: order(DocumentType.PURCHASE_ORDER),
      manufacturing: emptyOrder(),
      salesDeliveryNotes: order(DocumentType.WAYBILL),
      purchaseDeliveryNotes: order(DocumentType.REFERRALS),
    },
  };
};
