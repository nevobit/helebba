import { Collection, getModel } from "@hlb/constant-definitions";
import { Product, ProductId, ProductSchemaMongo } from "@hlb/contracts";

export const updateProduct = async (productId: ProductId, data:Partial<Product>) => {
    const model = getModel(Collection.PRODUCTS, ProductSchemaMongo);
    const updatedProduct = await model.updateOne({id: productId}, {$set: data})
    return updatedProduct;
}