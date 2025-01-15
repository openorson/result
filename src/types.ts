import type { ErrResult, OkResult } from './result'

export type Variant<T = unknown> = T | Promise<T> | (() => T) | (() => Promise<T>)
export type ArgsVariant<T = unknown, Args extends any[] = any[]> = T | Promise<T> | ((...args: Args) => T) | ((...args: Args) => Promise<T>)
export type VariantValue<T> = T extends (...args: any[]) => Promise<infer U> ? U : T extends (...args: any[]) => infer U ? U : T extends Promise<infer U> ? U : T

export type OkResultValue<T> = T extends OkResult<infer U> ? U : never
export type ErrResultCode<T> = T extends ErrResult<infer U> ? U : never

export type IsPromise<T> = T extends Promise<any> | ((...args: any[]) => Promise<any>) ? true : false
export type PromisifyUnion<T, U> = IsPromise<T> extends true ? U | Promise<U> : U
export type Promisify<T, U> = IsPromise<T> extends true ? Promise<U> : U

export type FnArgs<T> = T extends (...args: infer A) => any ? A : never
export type FnReturnValue<T> = T extends (...args: any[]) => infer V ? V extends Promise<infer V> ? V : V : never

export type CallbackFnArgs<T, U extends string, V extends string> = T extends [infer A0, ...infer R] ? [Omit<A0, U | V>, ...R] : never
export type CallbackFnResolveValue<T, U extends string> = T extends (...args: [infer A]) => any ? A extends { [K in U]: (...args: infer V) => any } ? V : never : never
