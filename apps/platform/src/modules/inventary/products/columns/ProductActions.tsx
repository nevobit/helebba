import { Menus } from '@hlb/design-system';
import { useNavigate } from 'react-router-dom';
import styles from '../screens/ProductsList/ProductsList.module.css';
import type { ProductRow } from '../types';

type ProductActionsProps = {
  product: ProductRow;
};

export const ProductActions = ({ product }: ProductActionsProps) => {
  const navigate = useNavigate();

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
            <Menus.Item id={`edit-${product.id}`} closeOnSelect={false}>
              Editar
            </Menus.Item>
            <Menus.Item id={`delete-${product.id}`} closeOnSelect={false}>
              Eliminar
            </Menus.Item>
          </Menus.List>
        </Menus.Menu>
      </Menus>
    </div>
  );
};
