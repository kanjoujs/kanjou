export type Message = undefined | string | Record<Intl.LDMLPluralRule, string>

export interface Register {}

export type Locale = Register extends { locale: infer L } ? L : string
export type Messages = Register extends { messages: infer M } ? M : Record<string, never>

export type MessageValues<Key extends keyof Messages> = Record<
  Messages[Key] extends undefined ? never : Messages[Key],
  string | number
>
