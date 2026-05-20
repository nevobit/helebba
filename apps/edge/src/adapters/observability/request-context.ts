import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
    readonly requestId: string;
    readonly tenantId?: string;
    readonly userId?: string;
    readonly path: string;
    readonly method: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const requestContext = {
    run: <T>(context: RequestContext, callback: () => T): T => {
        return storage.run(context, callback);
    },
    get: (): RequestContext | undefined => {
        return storage.getStore();
    },
};
