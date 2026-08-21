# Helebba SDK

Cliente TypeScript/JavaScript para integrar sistemas externos con la API de Helebba.
Soporta lectura de inventario y CRUD completo de documentos de ventas (facturas, ordenes, estimaciones, compras, notas de credito).

## Instalacion

```bash
npm install @helebba/sdk
# o
yarn add @helebba/sdk
# o
pnpm add @helebba/sdk
```

## Configuracion

```ts
import { createHelebbaClient } from '@helebba/sdk';

const helebba = createHelebbaClient({
  apiKey: process.env.HELEBBA_API_KEY!,
  // opcional: por defecto usa https://apis.helebba.com/api/v1
  // baseUrl: 'https://apis.staging.helebba.com/api/v1',
});
```

| Parametro | Requerido | Descripcion |
|-----------|-----------|-------------|
| `apiKey` | Si | API key con formato `hlb_dev_xxxxxxxx` |
| `baseUrl` | No | URL base de la API (default: `https://apis.helebba.com/api/v1`) |
| `fetcher` | No | Implementacion de `fetch` custom (para Node < 18, proxies, etc.) |

## Autenticacion

El SDK intercambia la API key por un token Bearer temporal de forma transparente:

1. Envia la API key en el header `api-key` al endpoint `/sdk/token`
2. Recibe un JWT de 15 minutos
3. Usa el JWT como `Authorization: Bearer <token>` en cada request
4. Renueva el token automaticamente cuando expira

**Desarrollo:** La API key debe incluir la organizacion:

```txt
DEV_API_KEYS="hlb_dev_xxxxxxxxxxxxxxxxxxxx:id=sdk-dev,organizationId=<org-id>,products=GSDK"
```

## API Reference

### Modulo: Inventario

#### `products.list(params?)`

Lista productos con paginacion offset.

```ts
const result = await helebba.products.list({
  page: 1,
  limit: 20,
  search: 'camisa',
});

// result.items: Product[]
// result.pageInfo: { page, pages, pageSize, totalItems, hasNextPage, ... }
```

| Param | Tipo | Descripcion |
|-------|------|-------------|
| `page` | `number` | Numero de pagina (default: 1) |
| `limit` | `number` | Elementos por pagina (default: 100) |
| `search` | `string` | Busqueda por nombre, SKU, descripcion |

#### `products.get(productId)`

Obtiene un producto por ID.

```ts
const product = await helebba.products.get('product-id-123');
// product: { id, name, sku, description, ... }
```

#### `brands.list(params?)`

Lista marcas de inventario.

```ts
const brands = await helebba.brands.list({ limit: 50 });
```

#### `categories.list(params?)`

Lista categorias de inventario.

```ts
const categories = await helebba.categories.list({ search: 'ropa' });
```

---

### Modulo: Documentos (Ventas/Compras)

El modulo de documentos permite crear y gestionar facturas, ordenes de venta, estimaciones, compras, notas de credito y mas.

#### Tipos de documento disponibles

| Constante | Valor | Descripcion |
|-----------|-------|-------------|
| `DocumentTypeValues.INVOICE` | `'invoice'` | Factura de venta |
| `DocumentTypeValues.SALES_ORDER` | `'sales-order'` | Orden de venta |
| `DocumentTypeValues.ESTIMATE` | `'estimate'` | Cotizacion/estimacion |
| `DocumentTypeValues.CREDIT_NOTE` | `'credit-note'` | Nota de credito |
| `DocumentTypeValues.RECEIPT_NOTE` | `'receipt-note'` | Nota de recibo |
| `DocumentTypeValues.PURCHASE` | `'purchase'` | Factura de compra |
| `DocumentTypeValues.PURCHASE_ORDER` | `'purchase-order'` | Orden de compra |
| `DocumentTypeValues.PROFORM` | `'proform'` | Proforma |
| `DocumentTypeValues.WAYBILL` | `'waybill'` | Remision |
| `DocumentTypeValues.EXPENSES` | `'expenses'` | Gastos |
| `DocumentTypeValues.QUOTES` | `'quotes'` | Cotizaciones |

#### `documents.create(input)`

Crea un nuevo documento.

```ts
import { createHelebbaClient, DocumentTypeValues } from '@helebba/sdk';

const invoice = await helebba.documents.create({
  docType: DocumentTypeValues.INVOICE,
  contactId: 'contact-id-123',
  contactName: 'Juan Perez',
  date: '2025-01-15T00:00:00.000Z',
  dueDate: '2025-02-15T00:00:00.000Z',
  paymentMethodId: 'payment-method-id',
  currency: 'COP',
  description: 'Venta de mercancia',
  tags: ['urgente', 'cliente-nuevo'],
  lines: [
    {
      concept: 'Camisa blanca',
      description: 'Camisa talla M, color blanco',
      price: 85000,
      units: 2,
      discount: 5000,
      tax: 19,
      taxes: ['IVA'],
      productId: 'product-id-456',
      sku: 'CAM-BLA-M-001',
      unitType: 'unit',
    },
    {
      concept: 'Pantalon jeans',
      description: 'Jeans talla 32',
      price: 120000,
      units: 1,
      tax: 19,
      taxes: ['IVA'],
      productId: 'product-id-789',
      sku: 'PAN-JEI-32-001',
      unitType: 'unit',
    },
  ],
  customFields: [
    { field: 'Referencia', value: 'REF-2025-001' },
  ],
});

// invoice: Document (con id, docNumber, total, etc.)
```

**Input para `documents.create`:**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `docType` | `DocumentType` | No | Tipo de documento (default: `invoice`) |
| `contactId` | `string` | Si | ID del contacto/cliente |
| `contactName` | `string` | No | Nombre del contacto |
| `description` | `string` | No | Descripcion del documento |
| `date` | `string` | No | Fecha ISO del documento |
| `dueDate` | `string` | No | Fecha de vencimiento ISO |
| `paymentMethodId` | `string` | No | ID del metodo de pago |
| `currency` | `string` | No | Moneda (default: `COP`) |
| `tags` | `string[]` | No | Etiquetas |
| `lines` | `ProductDocument[]` | No | Lineas/items del documento |
| `customFields` | `DocumentCustomField[]` | No | Campos personalizados |
| `status` | `StatusDocument` | No | Estado inicial |

**Estructura de cada linea (`ProductDocument`):**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `concept` | `string` | Si | Nombre del producto/servicio |
| `description` | `string` | No | Descripcion detallada |
| `price` | `number` | Si | Precio unitario |
| `units` | `number` | Si | Cantidad |
| `discount` | `number` | No | Descuento total |
| `tax` | `number` | Si | Porcentaje de impuesto (ej: 19 para IVA 19%) |
| `taxes` | `string[]` | No | Nombres de impuestos aplicables |
| `productId` | `string` | No | ID del producto en inventario |
| `variantId` | `string` | No | ID de variante |
| `serviceId` | `string` | No | ID de servicio |
| `sku` | `string` | No | Codigo SKU |
| `unitType` | `string` | No | Tipo de unidad (`unit`, `kg`, `m`, etc.) |

#### `documents.list(params?)`

Lista documentos con filtros y paginacion.

```ts
// Listar todas las facturas
const invoices = await helebba.documents.list({
  docType: DocumentTypeValues.INVOICE,
  page: 1,
  limit: 50,
});

// Filtrar por contacto
const clientDocs = await helebba.documents.list({
  contactId: 'contact-id-123',
});

// Buscar
const results = await helebba.documents.list({
  search: 'Juan Perez',
});
```

| Param | Tipo | Descripcion |
|-------|------|-------------|
| `docType` | `DocumentType` | Filtrar por tipo de documento |
| `contactId` | `string` | Filtrar por contacto |
| `paymentMethodId` | `string` | Filtrar por metodo de pago |
| `page` | `number` | Pagina |
| `limit` | `number` | Limite por pagina |
| `search` | `string` | Busqueda por texto |

#### `documents.get(documentId)`

Obtiene un documento por ID.

```ts
const doc = await helebba.documents.get('document-id-123');
// doc: Document
```

#### `documents.update(documentId, input)`

Actualiza un documento existente.

```ts
const updated = await helebba.documents.update('document-id-123', {
  description: 'Descripcion actualizada',
  dueDate: '2025-03-01T00:00:00.000Z',
  status: StatusDocumentValues.Paid,
});
```

#### `documents.delete(documentId)`

Elimina (soft delete) un documento.

```ts
await helebba.documents.delete('document-id-123');
// Retorna el documento eliminado
```

#### `documents.convert(documentId, input?)`

Convierte un documento a otro tipo.

```ts
// Convertir estimacion en factura
const invoice = await helebba.documents.convert('estimate-id-123', {
  docType: DocumentTypeValues.INVOICE,
});

// Convertir orden de compra en compra
const purchase = await helebba.documents.convert('po-id-123', {
  docType: DocumentTypeValues.PURCHASE,
});

// Conversion por defecto: estimate -> invoice, purchase-order -> purchase
const autoConverted = await helebba.documents.convert('doc-id-123');
```

**Conversiones tipicas:**

| Desde | Hacia | Ejemplo |
|-------|-------|---------|
| `estimate` | `invoice` | Cotizacion -> Factura |
| `purchase-order` | `purchase` | Orden de compra -> Factura de compra |
| `invoice` | `estimate` | Factura -> Estimacion |

#### `documents.sendEmail(documentId, input)`

Envia un documento por email.

```ts
await helebba.documents.sendEmail('document-id-123', {
  to: ['cliente@ejemplo.com'],
  cc: ['ventas@miempresa.com'],
  subject: 'Su factura #FAC-001',
  message: 'Adjunto encontrara su factura correspondiente.',
});
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `to` | `string \| string[]` | Destinatarios principales |
| `cc` | `string \| string[]` | Copia |
| `bcc` | `string \| string[]` | Copia oculta |
| `subject` | `string` | Asunto del email |
| `message` | `string` | Cuerpo del mensaje |

---

### Manejo de Errores

Todos los errores de la API se lanzan como `HelebbaApiError`:

```ts
import { createHelebbaClient, type HelebbaApiError } from '@helebba/sdk';

try {
  const doc = await helebba.documents.get('invalid-id');
} catch (error) {
  const apiError = error as HelebbaApiError;

  console.error(apiError.message);  // Mensaje descriptivo
  console.error(apiError.status);   // HTTP status code (404, 401, 422, etc.)
  console.error(apiError.body);     // Cuerpo de la respuesta de la API
}
```

**Codigos comunes:**

| Status | Descripcion |
|--------|-------------|
| `401` | API key invalida o token expirado |
| `403` | API key sin permisos para el recurso |
| `404` | Recurso no encontrado |
| `422` | Datos de entrada invalidos |
| `500` | Error interno del servidor |

---

### Tipos Exportados

El SDK exporta todos los tipos para TypeScript:

```ts
import type {
  // Cliente
  HelebbaClient,
  HelebbaClientOptions,

  // Inventario
  Product,
  InventoryBrand,
  Category,

  // Documentos
  Document,
  ProductDocument,
  DocumentCustomField,
  DocumentType,
  StatusDocument,

  // Inputs
  CreateDocumentInput,
  UpdateDocumentInput,
  ListDocumentsParams,
  ConvertDocumentInput,
  SendDocumentEmailInput,

  // Paginacion
  OffsetPaginatedResult,
  OffsetPageInfo,
  ListParams,

  // Errores
  HelebbaApiError,
} from '@helebba/sdk';

// Valores de enums
import {
  DocumentTypeValues,
  StatusDocumentValues,
} from '@helebba/sdk';
```

---

### Estados de documento

| Constante | Valor | Descripcion |
|-----------|-------|-------------|
| `StatusDocumentValues.Pending` | `0` | Pendiente de pago |
| `StatusDocumentValues.Paid` | `1` | Pagado completamente |
| `StatusDocumentValues.PartiallyPaid` | `2` | Parcialmente pagado |
| `StatusDocumentValues.Cancelled` | `3` | Cancelado |

---

## Ejemplos completos

### Crear orden de venta con multiples productos

```ts
import { createHelebbaClient, DocumentTypeValues } from '@helebba/sdk';

const helebba = createHelebbaClient({ apiKey: process.env.HELEBBA_API_KEY! });

const order = await helebba.documents.create({
  docType: DocumentTypeValues.SALES_ORDER,
  contactId: '64f1a2b3c4d5e6f7a8b9c0d1',
  contactName: 'Distribuidora ABC S.A.S.',
  description: 'Pedido #2025-045',
  date: new Date().toISOString(),
  dueDate: '2025-02-28T00:00:00.000Z',
  paymentMethodId: '64f1a2b3c4d5e6f7a8b9c0d2',
  currency: 'COP',
  tags: ['pedido-mayorista'],
  lines: [
    {
      concept: 'Laptop Dell Inspiron 15',
      description: 'Laptop 16GB RAM, 512GB SSD',
      price: 2800000,
      units: 5,
      tax: 19,
      taxes: ['IVA'],
      productId: '64f1a2b3c4d5e6f7a8b9c0d3',
      sku: 'LAP-DEL-15-001',
      unitType: 'unit',
    },
    {
      concept: 'Mouse inalambrico Logitech',
      description: 'Mouse bluetooth, color negro',
      price: 65000,
      units: 10,
      tax: 19,
      taxes: ['IVA'],
      productId: '64f1a2b3c4d5e6f7a8b9c0d4',
      sku: 'MOU-LOG-BT-001',
      unitType: 'unit',
    },
  ],
});

console.log(`Orden creada: ${order.docNumber} - Total: $${order.total.toLocaleString()}`);
```

### Crear factura desde una estimacion existente

```ts
const invoice = await helebba.documents.convert('estimate-id-123', {
  docType: DocumentTypeValues.INVOICE,
});
console.log(`Factura generada: ${invoice.docNumber}`);
```

### Listar facturas pendientes de un cliente

```ts
const pendingInvoices = await helebba.documents.list({
  docType: DocumentTypeValues.INVOICE,
  contactId: '64f1a2b3c4d5e6f7a8b9c0d1',
  page: 1,
  limit: 50,
});

for (const doc of pendingInvoices.items) {
  console.log(`${doc.docNumber} - $${doc.total} - Pendiente: $${doc.paymentsPending}`);
}
```
