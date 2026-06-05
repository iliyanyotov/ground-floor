// Branded string: a plain string at runtime, but only Account can produce one,
// so a raw string won't type-check as an AccountId.
declare const brand: unique symbol;

export type AccountId = string & { readonly [brand]: 'AccountId' };
