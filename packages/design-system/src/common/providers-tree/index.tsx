import React from 'react';

type ProviderEntry = [React.ElementType, Record<string, unknown>?];
type MountEntry = [React.ElementType, Record<string, unknown>?];

export function buildAppShell(providers: ProviderEntry[] = [], mounts: MountEntry[] = []) {
  const ProvidersTree = providers.reduce(
    (Accumulated, [Provider, props = {}]) =>
      ({ children }: { children: React.ReactNode }) => (
        <Accumulated>
          <Provider {...props}>{children}</Provider>
        </Accumulated>
      ),
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
  );

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <ProvidersTree>
      {children}
      {mounts.map(([Mount, props = {}], i) => (
        <Mount key={i} {...props} />
      ))}
    </ProvidersTree>
  );

  return Shell;
}
