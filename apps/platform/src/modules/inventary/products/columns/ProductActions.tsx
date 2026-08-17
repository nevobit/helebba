import { Menus, useModal } from '@hlb/design-system';
import { useNavigate } from 'react-router-dom';
import styles from '../screens/ProductsList/ProductsList.module.css';
import type { ProductRow } from '../types';
import { useCreateProductModal, useDeleteProduct } from '../hooks';

type ProductActionsProps = {
  product: ProductRow;
};

export const ProductActions = ({ product }: ProductActionsProps) => {
  const navigate = useNavigate();
  const { openEditProductModal } = useCreateProductModal();
  const { requestCloseModal } = useModal();
  const { deleteProduct, isDeletingProduct } = useDeleteProduct();

  const confirmDelete = () => {
    if (isDeletingProduct) return;
    requestCloseModal({
      confirm: true,
      title: 'Eliminar producto',
      description: `El producto “${product.name}” dejará de estar disponible. ¿Deseas continuar?`,
      confirmLabel: 'Eliminar producto',
      cancelLabel: 'Cancelar',
      onConfirm: () => deleteProduct(product.id),
    });
  };

  return (
    <div className={styles.rowActions} onClick={(event) => event.stopPropagation()}>
      <Menus defaultPlacement="bottom-end">
        <Menus.Menu>
          <Menus.Toggle
            id={`product-actions-${product.id}`}
            className={styles.rowActionsToggle}
            verticalIcon
            aria-label={`Acciones para ${product.name}`}
          />
          <Menus.List id={`product-actions-${product.id}`} placement="bottom-end">
            <Menus.Item id={`view-${product.id}`} onClick={() => navigate(`/products/${product.id}`)}>
              Ver
            </Menus.Item>
            <Menus.Item id={`edit-${product.id}`} onClick={() => openEditProductModal(product.id)}>
              Editar
            </Menus.Item>
            <Menus.Item id={`delete-${product.id}`} danger onClick={confirmDelete}>
              Eliminar
            </Menus.Item>
          </Menus.List>
        </Menus.Menu>
      </Menus>
    </div>
  );
};
