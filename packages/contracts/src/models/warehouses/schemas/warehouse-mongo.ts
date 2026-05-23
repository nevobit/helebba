import { Schema } from "mongoose";
import type { Warehouse } from "./warehouse";
import { opts } from "../../../common";

export const WarehouseSchemaMongo = new Schema<Warehouse>(
      {
        userId: {type: String},
        name: { type: String, required: true },
        email: { type: String },
        mobile: { type: String },
        phone: { type: String },
        addres: { type: String },
        isDefault: { type: Boolean },
        companyId: { type: String },
      },
    
      { ...opts},
)