export type Message = undefined | string | Record<Intl.LDMLPluralRule, string>

export interface Register {}

export type Locale = Register extends { locale: infer L } ? L : string
export type Messages = Register extends { messages: infer M } ? M : Record<string, never>

export type MessageValues<Key extends keyof Messages> = Record<
  Messages[Key] extends undefined ? never : Messages[Key],
  string | number
>

type ExtractParams<S extends string> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractParams<Rest>
  : never

type ResolveMessage<V> = V extends string
  ? [ExtractParams<V>] extends [never]
    ? undefined
    : ExtractParams<V>
  : V extends Record<Intl.LDMLPluralRule, string>
    ? ResolveMessage<V[keyof V]>
    : undefined

export type InferMessages<T extends Record<string, unknown>> = {
  [K in keyof T]: ResolveMessage<T[K]>
}
