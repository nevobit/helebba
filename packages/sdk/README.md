# Helebba SDK

Cliente minimo para leer inventario desde aplicaciones externas.

```ts
import { createHelebbaClient } from '@hlb/sdk';

const helebba = createHelebbaClient({
  apiKey: process.env.HELEBBA_API_KEY!,
});

const products = await helebba.products.list({ search: 'camisa' });
const brands = await helebba.brands.list();
const categories = await helebba.categories.list();
```

Para desarrollo, la API key debe incluir organizacion y scope:

```txt
DEV_API_KEYS="hlb_dev_xxxxxxxxxxxxxxxxxxxx:id=sdk-dev,organizationId=<org-id>,scopes=inventory:read,products=GSDK"
```
