import type { CompanyId, GroupId, PersistedSoftDeletableEntity, ProductId, TenantId, UserId } from "../../../common";

export interface Warehouse extends PersistedSoftDeletableEntity<ProductId, UserId> {
    customId: string,
    name: string,
    code: string,
    varnumber: string,
    tradeName: string,
    email: string,
    mobile: string,
    phone: string,
    type: string,
    iban: string,
    swift: string,
    groupId: GroupId;
    clientRecord: string,
    isPerson: boolean,
    companyId: CompanyId;
    tenantId: TenantId
}