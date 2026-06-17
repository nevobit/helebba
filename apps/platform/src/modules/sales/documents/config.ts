import { PrivateRoutes } from '@/app/router/routes';
import type { DocumentConfig, DocumentKind } from './types';

export const DOCUMENT_CONFIG: Record<DocumentKind, DocumentConfig> = {
  invoice: {
    kind: 'invoice',
    title: 'Facturas de venta',
    singularTitle: 'Factura',
    newLabel: 'Nueva factura',
    importLabel: 'Importar facturas',
    emptyTitle: 'Facturas de venta',
    emptyButton: 'Nueva factura',
    emptyArticle: 'Aprende rápidamente a crear y gestionar tus facturas de venta',
    listPath: PrivateRoutes.INVOICES,
    newPath: `${PrivateRoutes.INVOICES}/new`,
    endpoint: '/invoices',
    nextConvertLabel: 'Convertir en presupuesto',
  },
  estimate: {
    kind: 'estimate',
    title: 'Presupuestos',
    singularTitle: 'Presupuesto',
    newLabel: 'Nuevo presupuesto',
    importLabel: 'Importar presupuestos',
    emptyTitle: 'Presupuestos',
    emptyButton: 'Nuevo presupuesto',
    emptyArticle: 'Aprende rápidamente a crear y gestionar tus presupuestos',
    listPath: PrivateRoutes.ESTIMATES,
    newPath: `${PrivateRoutes.ESTIMATES}/new`,
    endpoint: '/estimates',
    nextConvertLabel: 'Convertir en factura',
  },
  purchase: {
    kind: 'purchase',
    title: 'Facturas de compra',
    singularTitle: 'Compra',
    newLabel: 'Nueva compra',
    importLabel: 'Importar compras',
    emptyTitle: 'Facturas de compra',
    emptyButton: 'Nueva compra',
    emptyArticle: 'Aprende a registrar y gestionar tus gastos fácilmente.',
    listPath: PrivateRoutes.PURCHASES,
    newPath: `${PrivateRoutes.PURCHASES}/new`,
    endpoint: '/purchases',
    nextConvertLabel: 'Convertir en factura',
  },
};

export const getDocumentConfig = (kind: DocumentKind) => DOCUMENT_CONFIG[kind];
