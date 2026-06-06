import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@hlb/design-system/css/web.css';
import { buildAppShell } from '@hlb/design-system';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { PersistedQueryProvider } from './providers';

import Application from './Application';

import { GoogleOAuthProvider } from '@react-oauth/google';

const AppShell = buildAppShell(
  [[PersistedQueryProvider, {}]],
  [[ReactQueryDevtools, { initialIsOpen: false }]],
);

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);

root.render(
  <StrictMode>
    <AppShell>
      <Application />
    </AppShell>
  </StrictMode>,
);
