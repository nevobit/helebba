# Helebba SDK

Cliente minimo para leer inventario desde aplicaciones externas.

```ts
import { createHelebbaClient } from '@helebba/sdk';

const helebba = createHelebbaClient({
  apiKey: process.env.HELEBBA_API_KEY!,
});

const products = await helebba.products.list({ search: 'camisa' });
const brands = await helebba.brands.list();
const categories = await helebba.categories.list();
```

El SDK intercambia la API key por un token Bearer temporal de forma transparente.

Para desarrollo, la API key debe incluir organizacion:

```txt
DEV_API_KEYS="hlb_dev_xxxxxxxxxxxxxxxxxxxx:id=sdk-dev,organizationId=<org-id>,products=GSDK"
```
