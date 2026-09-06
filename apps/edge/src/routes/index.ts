import type { FastifyInstance, RouteOptions } from 'fastify';
import { opsRoutes } from './ops';
import { contactRoutes } from './contacts';
import { warehouseRoutes } from './inventory/warehouses';
import { productRoutes } from './inventory/products';
import { categoryRoutes } from './inventory/categories';
import { brandRoutes } from './inventory/brands';
import { meRoutes } from './me';
import { accessRoutes } from './access';
import { roleRoutes } from './access/roles';
import { subscriptionRoutes } from './access/subscriptions';
import { serviceRoutes } from './sales/services';
import {
  creditNoteRoutes,
  estimateRoutes,
  expenseRoutes,
  invoiceRoutes,
  proformRoutes,
  purchaseOrderRoutes,
  purchaseRefundRoutes,
  purchaseRoutes,
  quoteRoutes,
  receiptNoteRoutes,
  referralRoutes,
  salesOrderRoutes,
  salesReceiptRoutes,
  waybillRoutes,
} from './sales/documents';
import { paymentMethodRoutes } from './treasury/payment-methods';
import { treasuryAccountRoutes } from './treasury/accounts';
import { treasuryOperationRoutes } from './treasury/operations';
import { paymentRoutes } from './accounting/payments';
import { mediaRoutes } from './inventory/media';
import { sdkRoutes } from './sdk';
import { productFieldDefinitionRoutes } from './inventory/product-field-definitions';
import { catalogRoutes } from './inventory/catalogs';
import { posRoutes } from './sales/pos';
import { crmFunnelRoutes } from './crm/funnels';
import { crmDealRoutes } from './crm/deals';
import { leadRoutes } from './crm/leads';
import { crmActivityRoutes } from './crm/activities';
import { crmPreferenceRoutes } from './crm/preferences';
import { productNoteRoutes } from './inventory/product-notes';
import { stockMovementRoutes } from './inventory/stock-movements';
import { priceListRoutes } from './inventory/price-lists';
import { publicCatalogRoutes } from './public/catalogs';
import { projectsRoutes } from './projects';
import { salesChannelRoutes } from './sales/channels';
import { expenseAccountRoutes } from './accounting/expense-accounts';
import { journalEntryRoutes } from './accounting/journal-entries';
import { taxRoutes } from './accounting/taxes';
import { employeeRoutes } from './team-hr/employees';
import { workforceRoutes } from './team-hr/workforce';
import { contactGroupRoutes } from './contacts/contact-groups';
import { contactTagRoutes } from './contacts/contact-tags';
import { calendarRoutes } from './calendar';
import { bookingRoutes } from './crm/bookings';
import { crmEventRoutes } from './crm/events';
import { developerWebhookRoutes } from './developers';
import { inboxRoutes } from './inbox';
import { numberingSeriesRoutes } from './sales/numbering-series';
import { recurringDocumentRoutes } from './sales/recurring-documents';
import { inventoryOperationRoutes } from './inventory/operations';
import { accountingCompatibilityRoutes } from './accounting/compatibility';
import { treasuryCompatibilityRoutes } from './treasury/compatibility';

const routes: RouteOptions[] = [
  ...opsRoutes,
  ...accessRoutes,
  ...productRoutes,
  ...categoryRoutes,
  ...brandRoutes,
  ...contactRoutes,
  ...warehouseRoutes,
  ...meRoutes,
  ...roleRoutes,
  ...subscriptionRoutes,
  ...serviceRoutes,
  ...invoiceRoutes,
  ...salesReceiptRoutes,
  ...creditNoteRoutes,
  ...receiptNoteRoutes,
  ...estimateRoutes,
  ...salesOrderRoutes,
  ...waybillRoutes,
  ...proformRoutes,
  ...purchaseRoutes,
  ...purchaseRefundRoutes,
  ...purchaseOrderRoutes,
  ...referralRoutes,
  ...quoteRoutes,
  ...expenseRoutes,
  ...paymentMethodRoutes,
  ...treasuryAccountRoutes,
  ...treasuryOperationRoutes,
  ...paymentRoutes,
  ...mediaRoutes,
  ...sdkRoutes,
  ...productFieldDefinitionRoutes,
  ...catalogRoutes,
  ...posRoutes,
  ...crmFunnelRoutes,
  ...crmDealRoutes,
  ...leadRoutes,
  ...crmActivityRoutes,
  ...crmPreferenceRoutes,
  ...productNoteRoutes,
  ...stockMovementRoutes,
  ...priceListRoutes,
  ...publicCatalogRoutes,
  ...projectsRoutes,
  ...salesChannelRoutes,
  ...expenseAccountRoutes,
  ...journalEntryRoutes,
  ...taxRoutes,
  ...employeeRoutes,
  ...workforceRoutes,
  ...contactGroupRoutes,
  ...contactTagRoutes,
  ...calendarRoutes,
  ...bookingRoutes,
  ...crmEventRoutes,
  ...developerWebhookRoutes,
  ...inboxRoutes,
  ...numberingSeriesRoutes,
  ...recurringDocumentRoutes,
  ...inventoryOperationRoutes,
  ...accountingCompatibilityRoutes,
  ...treasuryCompatibilityRoutes,
];

export const registerRoutes = (app: FastifyInstance) => {
  routes.map((route) => app.route(route));
};
