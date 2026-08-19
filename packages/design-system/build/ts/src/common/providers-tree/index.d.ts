import React from 'react';
type ProviderEntry = [React.ElementType, Record<string, unknown>?];
type MountEntry = [React.ElementType, Record<string, unknown>?];
export declare function buildAppShell(providers?: ProviderEntry[], mounts?: MountEntry[]): ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map