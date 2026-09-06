import type { Id } from './brand';

export type EntityId = Id<'EntityId'>;
export type CompanyId = Id<'CompanyId'>;

// Domain identifiers are re-exported from `common` because the persisted
// schemas depend on this module without importing the complete model barrels.
// Keeping the brands here also prevents runtime schema imports from depending
// on type-only domain modules.
export type OrganizationId = Id<'OrganizationId'>;
export type UserId = Id<'UserId'>;
export type ApiKeyId = Id<'ApiKeyId'>;
export type SubscriptionId = Id<'SubscriptionId'>;
export type BranchId = Id<'BranchId'>;
export type ApiUsageId = Id<'ApiUsageId'>;

export type ExpenseAccountId = Id<'ExpenseAccountId'>;
export type PaymentId = Id<'PaymentId'>;
export type TaxId = Id<'TaxId'>;
export type JournalEntryId = Id<'JournalEntryId'>;

export type CalendarEventId = Id<'CalendarEventId'>;
export type BookingId = Id<'BookingId'>;

export type ContactId = Id<'ContactId'>;
export type GroupId = Id<'GroupId'>;
export type ContactTagId = Id<'ContactTagId'>;

export type CrmFunnelId = Id<'CrmFunnelId'>;
export type CrmStageId = Id<'CrmStageId'>;
export type CrmOpportunityId = Id<'CrmOpportunityId'>;
export type CrmActivityId = Id<'CrmActivityId'>;

export type WebhookSubscriptionId = Id<'WebhookSubscriptionId'>;
export type WebhookDeliveryId = Id<'WebhookDeliveryId'>;

export type InboxConversationId = Id<'InboxConversationId'>;
export type InboxMessageId = Id<'InboxMessageId'>;
export type InboxDocumentId = Id<'InboxDocumentId'>;

export type ProductId = Id<'ProductId'>;
export type CategoryId = Id<'CategoryId'>;
export type BrandId = Id<'BrandId'>;
export type WarehouseId = Id<'WarehouseId'>;
export type PriceListId = Id<'PriceListId'>;
export type CatalogId = Id<'CatalogId'>;
export type CatalogOrderId = Id<'CatalogOrderId'>;
export type ProductNoteId = Id<'ProductNoteId'>;
export type StockMovementId = Id<'StockMovementId'>;
export type InventoryStockId = Id<'InventoryStockId'>;
export type StockTransferId = Id<'StockTransferId'>;
export type InventoryLotId = Id<'InventoryLotId'>;
export type ProductionOrderId = Id<'ProductionOrderId'>;
export type ProductFieldDefinitionId = Id<'ProductFieldDefinitionId'>;

export type ProjectId = Id<'ProjectId'>;
export type ProjectListId = Id<'ProjectListId'>;
export type ProjectTaskId = Id<'ProjectTaskId'>;
export type ProjectTimeEntryId = Id<'ProjectTimeEntryId'>;

export type ServiceId = Id<'ServiceId'>;
export type SalesChannelId = Id<'SalesChannelId'>;
export type NumberingSeriesId = Id<'NumberingSeriesId'>;
export type RecurringDocumentId = Id<'RecurringDocumentId'>;
export type DocumentId = Id<'DocumentId'>;
export type PosStoreId = Id<'PosStoreId'>;
export type PosRegisterId = Id<'PosRegisterId'>;
export type PosSessionId = Id<'PosSessionId'>;
export type PosReceiptId = Id<'PosReceiptId'>;

export type EmployeeId = Id<'EmployeeId'>;
export type EmploymentContractId = Id<'EmploymentContractId'>;
export type TimeClockEntryId = Id<'TimeClockEntryId'>;
export type PayrollRecordId = Id<'PayrollRecordId'>;
export type LeaveRequestId = Id<'LeaveRequestId'>;

export type BankingAccountId = Id<'BankingAccountId'>;
export type PaymentMethodId = Id<'PaymentMethodId'>;
export type RemittanceId = Id<'RemittanceId'>;
export type BillingForecastId = Id<'BillingForecastId'>;
export type TreasuryMovementId = Id<'TreasuryMovementId'>;
