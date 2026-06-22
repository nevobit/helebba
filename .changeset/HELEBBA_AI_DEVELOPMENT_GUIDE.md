# Helebba AI Development Guide

> Guía para que una IA, agente de código o desarrollador trabaje dentro del proyecto Helebba sin romper arquitectura, diseño ni estándares.

## 1. Contexto del producto

Helebba es una plataforma SaaS de gestión empresarial para pymes, emprendedores y empresas en crecimiento en Latinoamérica.

La filosofía del producto es:

> Toda la empresa en un solo lugar.

Helebba centraliza operaciones como CRM, ventas, facturación, gastos, pagos, inventario, tesorería, configuración, usuarios, roles y permisos.

El código debe sentirse como un producto empresarial serio: limpio, escalable, mantenible, modular y consistente visualmente.

## 2. Stack principal

- Monorepo con PNPM Workspaces, Catalog, y Turborepo.
- TypeScript como lenguaje base.
- Frontend principal plataforma: React + Vite.
- Frontend principal sitio marketing: NextJs
- Backend/API: Node + Fastify.
- Data fetching frontend: `@tanstack/react-query`.
- Estado frontend: Zustand cuando aplique.
- UI: `@hlb/design-system`.
- Contratos compartidos: `@hlb/contracts`.
- Helpers reutilizables: `@hlb/foundation`.
- Integraciones externas: `@hlb/integrations`.
- Contexto global/runtime: `@hlb/kernel` mediante `MonoContext`.
- Constantes, helpers de rutas y helpers globales: `@hlb/constant-definitions`.

## 3. Estructura general del monorepo

```txt
apps/
  edge/       # Backend Fastify / API
  platform/   # Aplicación web principal
  site/       # Landing o sitio público

packages/
  business-logic/          # Casos de uso reutilizables si aplican fuera de edge
  constant-definitions/    # Constantes, route helpers, MonoContext helpers
  contracts/               # Tipos compartidos frontend/backend
  data-sources/            # Acceso a datos / fuentes / bases de datos
  design-system/           # Componentes UI, tokens y estilos base
  foundation/              # Helpers puros, reutilizables e isomórficos
  integrations/            # Clientes/proveedores externos: email, storage, AWS, etc.
  kernel/                  # MonoContext y núcleo compartido
  security/                # Auth, JWT, seguridad
  tooling/                 # Configuración de tooling y typescirpt, tsconfig
```

## 4. Reglas de oro

1. No duplicar lógica si ya existe en `foundation`, `contracts`, `design-system` o `integrations`.
2. No crear componentes UI desde cero si ya hay un componente equivalente en `@hlb/design-system`.
3. No usar colores, espacios, radios o sombras hardcodeadas si existen tokens.
4. No meter lógica de negocio compleja en componentes React.
5. No meter lógica de negocio compleja en rutas Fastify.
6. No crear clientes externos dentro de cada request si pueden inicializarse una vez en bootstrap.
7. No usar clases salvo que el proyecto ya lo exija explícitamente. Preferir factories, funciones puras y objetos.
8. No usar `any` salvo caso muy justificado.
9. No exponer tokens, API keys, JWTs o datos sensibles en logs.
10. No importar APIs de Node.js en código que pueda ejecutarse en frontend.

## 5. Design System

El frontend debe usar `@hlb/design-system` como fuente principal de UI.

Componentes existentes detectados:

```txt
@hlb/design-system
  Button
  TextInput
  NumberInput
  CurrencyInput
  Select
  SearchableSelect
  Field
  Table
  Modal
  Menus
  Spinner
  LineScaleLoader
  Tooltip
  Avatar
  Portal
  FocusGuard
  VisuallyHidden
```

Antes de crear un componente nuevo, revisar si ya existe en el design system.

### Import correcto

```tsx
import { Button, TextInput, Select } from '@hlb/design-system';
```

### Evitar

```tsx
<button className="primaryButton">Guardar</button>
<input className="customInput" />
```

A menos que se esté construyendo un componente nuevo del design system.

## 6. Tokens y CSS Modules

Helebba usa CSS Modules en la app.

Patrón esperado:

```tsx
import styles from './Component.module.css';
```

Los estilos deben usar tokens.

### Correcto

```css
.card {
  padding: var(--ds-space-6);
  border: 0.1rem solid var(--color-border);
  border-radius: var(--ds-radius-lg);
  background: var(--color-surface);
  color: var(--color-text);
}
```

### Evitar

```css
.card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #111827;
}
```

### Tokens recomendados

```txt
--ds-space-*
--ds-radius-*
--ds-font-size-*
--ds-focus-ring-*
--color-text
--color-text-muted
--color-border
--color-surface
--color-surface-muted
--color-accent
```

## 7. Frontend: estructura por módulo

Los módulos de `apps/platform` deben organizarse por dominio.

Estructura recomendada:

```txt
apps/platform/src/modules/<domain>/
  components/
  screens/
  hooks/
  services/
  mappers/
  columns/
  types/
  routes/
  index.ts
```

Ejemplo:

```txt
modules/contacts/
  components/
  screens/
  hooks/
  services/
  mappers/
  columns/
  types/
  routes/
```

## 8. Frontend: responsabilidades

### Screens

Las pantallas deben orquestar, no contener demasiada lógica.

Deben encargarse de:

- Componer layout.
- Conectar hooks.
- Pasar props.
- Manejar selección local simple.

Evitar:

- Transformaciones complejas.
- Validaciones de negocio profundas.
- Fetch directo.
- Mutaciones API inline.
- `window.confirm` y `window.alert` para flujos importantes.

### Hooks

Los hooks deben encapsular lógica de UI, query params, paginación, filtros y mutaciones.

Ejemplo:

```ts
const controller = useContactsListController();
```

### Services

Los services hacen llamadas HTTP.

Ejemplo:

```ts
export const createContact = async (payload: CreateContactPayload) => {
  const { data } = await api.post<Contact>('/contacts', payload);
  return data;
};
```

### Mappers

Los mappers convierten datos de API a datos de UI.

Ejemplo:

```ts
export const mapContactToRow = (contact: Contact): ContactRow => ({
  id: contact.id,
  name: contact.displayName,
});
```

## 9. React Query

Usar `@tanstack/react-query` para consultas y mutaciones.

Preferir query key factories cuando el módulo crezca.

```ts
export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactsKeys.lists(), filters] as const,
  detail: (id: string) => [...contactsKeys.all, 'detail', id] as const,
};
```

Después de mutaciones, invalidar queries relacionadas.

```ts
queryClient.invalidateQueries({ queryKey: contactsKeys.all });
```

## 10. Backend Edge

`apps/edge` contiene rutas Fastify, configuración del servidor y conexión con casos de uso.

Las rutas deben ser delgadas.

Una ruta debe:

- Validar mínimamente el body.
- Resolver usuario/organización desde request.
- Llamar business logic.
- Responder HTTP.

Una ruta no debe:

- Crear clientes AWS, Resend, bancos, etc. por request.
- Contener reglas de negocio largas.
- Hacer cálculos financieros complejos.
- Conocer detalles internos de proveedores externos.

## 11. Backend: patrón de rutas

Usar `makeFastifyRoute`, `RouteMethod` y middlewares existentes.

Ejemplo:

```ts
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';
import { createPresignedUploadUrl } from '../../business-logic/media';

export const createPresignedUploadUrlRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/presigned-upload-url',
  verifyJwt,
  {
    auth: 'required',
    organization: 'required',
  },
  async (req, reply) => {
    // validación mínima
    // llamada a business logic
    // respuesta HTTP
  },
);
```

Registrar rutas con `withPrefix`:

```ts
import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createPresignedUploadUrlRoute } from './create-presigned-upload-url';

export const mediaRoutes: RouteOptions[] = withPrefix('/media', [createPresignedUploadUrlRoute]);
```

## 12. Business logic

La lógica de negocio debe vivir fuera de rutas y fuera de componentes UI.

Ubicaciones válidas:

```txt
apps/edge/src/business-logic/<domain>/
```

O si es reusable entre apps:

```txt
packages/business-logic/src/<domain>/
```

La business logic debe:

- Recibir inputs tipados.
- Validar reglas del caso de uso.
- Usar helpers de `foundation`.
- Usar providers desde helpers/context cuando aplique.
- Retornar outputs tipados.

Debe evitar:

- `req`, `reply`, `FastifyRequest`, `FastifyReply`.
- Código UI.
- Dependencias directas del navegador.
- Instanciar clientes externos por cada llamada si ya existen en contexto.

## 13. MonoContext

El proyecto tiene `MonoContext` en:

```txt
packages/kernel/src/mono-context/index.ts
```

Se usa como contexto global de runtime para dependencias compartidas como:

```txt
logger
mailer
dataSources
name
version
```

Es válido agregar providers globales como `storageProvider` al `MonoContext` cuando:

- El provider se inicializa una sola vez en bootstrap.
- El provider es una dependencia transversal.
- Se quiere evitar crear clientes externos por request.

## 14. Regla para MonoContext

Evitar que la business logic importe directamente `@hlb/kernel`.

Preferir helpers en `@hlb/constant-definitions`:

```ts
setStorageProvider(storageProvider);
getStorageProvider();
```

Cadena recomendada:

```txt
edge bootstrap
  setStorageProvider()

business-logic
  getStorageProvider()

integrations
  createStorageProvider()
```

Esto mantiene una arquitectura consistente con el proyecto.

## 15. Integrations

`@hlb/integrations` debe contener integración con proveedores externos.

Ejemplos:

```txt
AWS S3
Resend
Bancos
Pasarelas de pago
WhatsApp
Google Workspace
```

Debe contener:

- Factories.
- Providers.
- Clientes externos.
- Adaptadores técnicos.

No debe contener:

- Rutas HTTP.
- Reglas de negocio de Helebba.
- Validación de permisos.
- Conocimiento de `req` o `reply`.

## 16. Foundation

`@hlb/foundation` contiene helpers puros y reutilizables.

Debe ser browser-safe e isomórfico.

Puede usarse en:

```txt
frontend
backend
tests
React Native
workers
```

Por eso no debe importar APIs de Node.js como:

```ts
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
```

### Correcto en foundation

```ts
export const sanitizeStorageFolder = (folder: string) =>
  folder.trim().replace(/^\/+/, '').replace(/\/+$/, '');
```

### Incorrecto en foundation

```ts
import { randomUUID } from 'node:crypto';
```

Si se necesita una API de Node, debe vivir en `apps/edge` o en un paquete server-only.

## 17. Contracts

`@hlb/contracts` debe contener tipos compartidos entre frontend y backend.

Usar contracts para:

- Entidades de dominio.
- Payloads de request.
- Responses compartidas.
- IDs tipados.
- Estados del negocio.

Ejemplo:

```ts
export type CreatePresignedUploadUrlRequest = {
  filename: string;
  contentType: string;
  size: number;
  folder?: string;
};

export type CreatePresignedUploadUrlResponse = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  contentType: string;
  size: number;
  expiresIn: number;
};
```

No duplicar tipos entre backend y frontend si pueden vivir en contracts.

## 18. Data sources

`@hlb/data-sources` debe contener acceso a persistencia o fuentes externas de datos cuando aplique.

La business logic no debería conocer detalles innecesarios de MongoDB, PostgreSQL, Redis o APIs externas.

Preferir repositorios/adaptadores.

## 19. Naming

Usar nombres claros, empresariales y consistentes.

Preferir:

```txt
contacts
invoices
estimates
payments
payment-methods
treasury-accounts
media
inventory
```

Evitar typos como:

```txt
inventary
```

Si ya existe un typo histórico, no romper el proyecto sin migración planificada.

## 20. Manejo de errores

Evitar `window.alert` y `window.confirm` en frontend.

Preferir componentes del design system:

- Modal de confirmación.
- Toast/feedback si existe.
- Estados de error dentro de componentes.

En backend:

- No filtrar errores técnicos al usuario final.
- No responder stack traces.
- No loggear secretos.
- Usar mensajes humanos y accionables.

## 21. Seguridad

Nunca exponer:

```txt
JWT
refresh tokens
API keys
AWS secrets
connection strings
passwords
HMAC secrets
```

No imprimir en logs:

```ts
console.log(req.headers.authorization);
console.log(token);
console.log(apiKey);
```

Usar logger formal del proyecto cuando aplique.

## 22. Variables de entorno

No versionar `.env` reales.

Versionar únicamente ejemplos:

```txt
.env.example
```

Toda variable nueva debe agregarse al validador de entorno correspondiente.

Ejemplo:

```ts
STORAGE_PROVIDER: str({ choices: ['aws-s3'], default: 'aws-s3' }),
AWS_REGION: str({ default: 'us-east-1' }),
AWS_ACCESS_KEY_ID: str(),
AWS_SECRET_ACCESS_KEY: str(),
AWS_S3_BUCKET: str(),
AWS_S3_PUBLIC_BASE_URL: str({ default: '' }),
```

## 23. Patrón recomendado para subir archivos

Para imágenes y archivos, usar módulo `media`.

Flujo recomendado:

```txt
frontend
  pide presigned URL

edge route
  valida HTTP y organización

business logic
  valida reglas del archivo
  genera key
  pide URL al storage provider

storage provider
  genera URL firmada con S3

frontend
  sube directo a S3
```

No subir archivos pesados a través del backend si se puede evitar.

## 24. AWS/S3

AWS/S3 debe vivir en `@hlb/integrations`.

Ejemplo de estructura:

```txt
packages/integrations/src/storage/
  contracts/
    storage-provider.ts
  providers/
    aws-s3/
      create-s3-client.ts
      create-aws-s3-storage-provider.ts
      index.ts
  factory/
    create-storage-provider.ts
  index.ts
```

El backend no debe conocer detalles internos de `PutObjectCommand` si ya existe provider.

## 25. Patrón de dependencias correcto

```txt
apps/platform
  usa @hlb/design-system
  usa @hlb/contracts
  usa @hlb/foundation
  llama apps/edge vía services

apps/edge
  usa @hlb/contracts
  usa @hlb/foundation
  usa @hlb/constant-definitions
  usa business-logic

business-logic
  usa @hlb/contracts
  usa @hlb/foundation
  usa helpers de providers

@hlb/integrations
  habla con terceros

@hlb/foundation
  funciones puras, browser-safe

@hlb/design-system
  componentes visuales y tokens
```

## 26. Qué debe evitar una IA

Una IA no debe:

- Crear componentes visuales ignorando `@hlb/design-system`.
- Usar colores hardcodeados.
- Crear lógica de negocio dentro de JSX.
- Crear rutas enormes.
- Instanciar AWS, Resend o DB clients dentro de cada handler sin razón.
- Usar clases si se puede resolver con factories/funciones.
- Importar `node:*` en paquetes usados por frontend.
- Duplicar tipos que deben estar en `@hlb/contracts`.
- Duplicar helpers que deben estar en `@hlb/foundation`.
- Escribir `any` para salir rápido del problema.
- Usar `console.log` con datos sensibles.
- Cambiar estructura del proyecto sin justificación.
- Romper nombres de rutas públicas sin migración.
- Mezclar español e inglés en nombres técnicos sin criterio.

## 27. Qué debe hacer una IA antes de codificar

Antes de escribir código, revisar:

1. ¿Existe un componente en `@hlb/design-system`?
2. ¿Existe un tipo en `@hlb/contracts`?
3. ¿Existe un helper en `@hlb/foundation`?
4. ¿La integración debe vivir en `@hlb/integrations`?
5. ¿La lógica pertenece a business-logic y no a route/component?
6. ¿El código correrá en navegador? Si sí, no usar APIs de Node.
7. ¿Se requiere token CSS en vez de valor hardcodeado?
8. ¿Se debe invalidar React Query después de una mutación?
9. ¿Se está respetando multiempresa/organización activa?
10. ¿Se están evitando logs sensibles?

## 28. Checklist para nuevos módulos frontend

Para crear un módulo nuevo en `apps/platform`:

```txt
modules/<domain>/
  components/
  hooks/
  services/
  screens/
  types/
  mappers/
  routes/
  index.ts
```

Checklist:

- [ ] Usa componentes de `@hlb/design-system`.
- [ ] Usa CSS Modules con tokens.
- [ ] Usa services para API calls.
- [ ] Usa React Query para server state.
- [ ] Usa hooks para lógica de pantalla.
- [ ] Usa mappers si transforma datos.
- [ ] Usa contracts compartidos si aplica.
- [ ] No tiene lógica de negocio pesada en JSX.

## 29. Checklist para nuevas rutas backend

Para crear una ruta nueva en `apps/edge`:

- [ ] Crear route con `makeFastifyRoute`.
- [ ] Usar `RouteMethod`.
- [ ] Aplicar `verifyJwt` si requiere auth.
- [ ] Definir `auth: 'required'` cuando aplique.
- [ ] Definir `organization: 'required'` cuando aplique.
- [ ] Validar body mínimamente.
- [ ] Llamar a business logic.
- [ ] No poner lógica larga en route.
- [ ] No crear providers externos dentro del handler si ya están en context.
- [ ] Responder errores de forma controlada.

## 30. Checklist para nuevas integraciones

Para integrar un tercero:

- [ ] Crear provider en `@hlb/integrations`.
- [ ] Crear contrato del provider.
- [ ] Crear factory.
- [ ] Inicializar provider en bootstrap si es global.
- [ ] Guardar provider en `MonoContext` si aplica.
- [ ] Exponer helpers `setX/getX` desde `@hlb/constant-definitions` si aplica.
- [ ] Mantener business logic sin detalles técnicos del proveedor.

## 31. Estilo de código

Preferir:

```ts
export const createThing = (input: CreateThingInput) => {
  // ...
};
```

Evitar clases:

```ts
class ThingService {
  // evitar salvo necesidad real
}
```

Preferir types explícitos:

```ts
export type CreatePaymentInput = {
  invoiceId: string;
  amount: number;
};
```

Evitar:

```ts
const payload: any = {};
```

## 32. Filosofía de producto aplicada al código

Helebba debe sentirse como una plataforma de gestión seria para empresas reales.

Cada funcionalidad debe buscar:

- Claridad.
- Trazabilidad.
- Seguridad.
- Consistencia visual.
- Multiempresa desde el diseño.
- Escalabilidad técnica.
- Experiencia profesional.

No construir como demo. Construir como SaaS que puede cobrar.

## 33. Regla final

Cuando haya duda, seguir este orden:

```txt
1. Mantener arquitectura limpia.
2. Reutilizar paquetes existentes.
3. Respetar design system y tokens.
4. Evitar acoplamientos innecesarios.
5. Hacer el código testeable.
6. Proteger datos sensibles.
7. Pensar en multiempresa.
```

Helebba no debe crecer como una colección de pantallas. Debe crecer como un sistema operativo empresarial coherente.
