import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { authLoader, guestLoader } from '../loaders';
import { PrivateRoutes } from './route-paths';
import withSuspense from '../utils/with-suspense';

const AppShell = lazy(() => import('@/app/components/Layout/AppShell'));

export const privateRoutes: RouteObject[] = [
  {
    path: PrivateRoutes.ROOT,
    loader: guestLoader,
    element: withSuspense(<AppShell />),
    // errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(
          <div style={{ padding: '20px' }}>
            <title>Contactos - Helebba</title>

            <div
              style={{
                color: '#0F172A',
                fontSize: '24px',
                fontWeight: '700',
                letterSpacing: '.4px',
                lineHeight: '32px',
              }}
            >
              Contactos
              {/* <Button>Click me</Button>
              <Button variant="solid" tone="neutral">
                Guardar
              </Button>
              <Button tone="critical">Eliminar</Button>
              <Button tone="success">Aprobar</Button>
              <Button variant="outline" tone="critical">
                Aprobar
              </Button>
              <Button variant="outline" tone="success">
                Published
              </Button>
              <Button variant="ghost" theme="monochrome">
                Cancelar
              </Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="ghost" tone="critical">
                Delete
              </Button>
              <Button variant="plain">Learn more</Button>
              <Button theme="monochrome" size="medium">
                Continue
              </Button>
              <Button variant="outline" theme="monochrome">
                Continue
              </Button>
              <Button variant="ghost" theme="monochrome">
                Continue
              </Button>
              <TextInput
                label="Text input"
                hint="This is a hint"
                placeholder="Type something..."
                suffix="Suffix"
              />
              <NumberInput label={''} step={10} />
              <CurrencyInput currency="COP" locale="es-CO" label={''} />
              <div>hola</div>
              <Table columns={columns} rows={[]} emptyText="Hola mundo" /> */}
            </div>
          </div>,
        ),
      },
    ],
  },
];
