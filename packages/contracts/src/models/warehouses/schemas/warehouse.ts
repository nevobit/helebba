import type { CompanyId, GroupId, PersistedSoftDeletableEntity, ProductId, TenantId, UserId } from "../../../common";

export interface Warehouse extends PersistedSoftDeletableEntity<ProductId, UserId> {
    userId: UserId,
    name: string,
    email: string,
    mobile: string,
    phone: string,
    addres: string,
    isDefault: boolean,
    companyId: CompanyId;
    tenantId: TenantId
}