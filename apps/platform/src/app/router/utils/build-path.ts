type ParamKeys<S extends string> =
    S extends `${string}:${infer P}/${infer R}`
    ? (P extends `${infer K}?` ? K : P) | ParamKeys<`/${R}`>
    : S extends `${string}:${infer P}`
    ? (P extends `${infer K}?` ? K : P)
    : never;

export type ParamsOf<S extends string> =
    [ParamKeys<S>] extends [never]
    ? Record<string, never>
    : { [K in ParamKeys<S>]: string | number };

export function buildPath<T extends string>(
    template: T,
    params: ParamsOf<T>
): string {
    let path = template as string;

    for (const [key, value] of Object.entries(params as Record<string, string | number>)) {
        path = path.replace(new RegExp(`:${key}\\b`, "g"), encodeURIComponent(String(value)));
    }

    if (/:([A-Za-z0-9_]+)/.test(path)) {
        const missing = Array.from(path.matchAll(/:([A-Za-z0-9_]+)/g)).map(m => m[1]);
        throw new Error(`Faltan params para la ruta "${template}": ${missing.join(", ")}`);
    }

    return path;
}

export const createPathBuilder =
    <T extends string>(template: T) =>
        (params: ParamsOf<T>) =>
            buildPath(template, params);
