export type Message = undefined | string | Record<Intl.LDMLPluralRule, string>

export interface Register {}

export type Locale = Register extends { locale: infer L } ? L : string
export type Messages = Register extends { messages: infer M } ? M : Record<string, never>

export type MessageValues<Key extends keyof Messages> = Record<
  Messages[Key] extends undefined ? never : Messages[Key],
  string | number
>

type ExtractParams<String extends string> = String extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractParams<Rest>
  : never

type ResolveMessage<Value> = Value extends string
  ? [ExtractParams<Value>] extends [never]
    ? undefined
    : ExtractParams<Value>
  : Value extends Record<Intl.LDMLPluralRule, string>
    ? ResolveMessage<Value[keyof Value]>
    : undefined

export type InferMessages<Messages extends Record<string, unknown>> = {
  [Key in keyof Messages]: ResolveMessage<Messages[Key]>
}
