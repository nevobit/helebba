import { Collection, getModel } from "@hlb/constant-definitions";
import { ProductId, ProductSchemaMongo } from "@hlb/contracts";

export const deleteProduct = async (id: ProductId) => {
    const model = getModel(Collection.PRODUCTS, ProductSchemaMongo);
    const product = await model.deleteOne({id: id});
    return product;
} 