import { type Product, ProductSchemaMongo } from '@hlb/contracts';
import { getModel, Collection } from '@hlb/constant-definitions';

//Data es lo que recibimos
export const createProduct = async (data: Product): Promise<Product> => {
  //Crea una instancia del modelo de producto utilizando el esquema de Mongoose y la colección definida en las constantes. Luego, guarda el nuevo producto en la base de datos y devuelve el producto creado.
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);

  // creamos una nueva instancia del modelo de producto utilizando los datos proporcionados y luego guardamos esa instancia en la base de datos. Finalmente, devolvemos el producto creado.
  const product = new model(data);
  // guardamos el nuevo producto en la base de datos y devolvemos el producto creado.
  const createdProduct = await product.save();

  //retornamos el producto creado, que incluye cualquier información adicional generada por la base de datos, como el ID único asignado al producto.
  return createdProduct;
};
