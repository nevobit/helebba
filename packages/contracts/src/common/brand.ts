declare const brand: unique symbol;

export type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };
export type Id<T extends string> = Brand<string, T>;
