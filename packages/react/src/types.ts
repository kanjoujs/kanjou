import type { Model, MessageFormatOptions as MfOptions } from 'messageformat'
import type { MessageFunctionContext, MessageValue } from 'messageformat/functions'

export interface Register {}

export type Message = string | Model.Message
export type DefaultMessageValue = string | number
export type DefaultMessages = Record<string, Record<string, DefaultMessageValue>>

export type MapPartsType<Key extends MessageKey> = {
  [Value in keyof Messages[Key]]: Messages[Key][Value] extends {
    __fn: infer FunctionName extends keyof Functions
  }
    ? Functions[FunctionName] extends MessageFunction<any, any, any, infer PartsType>
      ? PartsType
      : 'string'
    : Messages[Key][Value] extends number | bigint
      ? 'number'
      : 'string'
}
export type InferPartsType<Key extends MessageKey> = MapPartsType<Key>[keyof MapPartsType<Key>]

export type MessageFunction<
  Options = Record<string, unknown>,
  Input = unknown,
  MessageType extends string = string,
  PartsType extends string = MessageType,
> = (
  context: MessageFunctionContext,
  options: Options,
  input?: Input,
) => MessageValue<MessageType, PartsType>

export type MessageFormatOptions<
  MessageType extends string = string,
  PartsType extends string = MessageType,
> = Omit<MfOptions<MessageType, PartsType>, 'functions'> & {
  functions?: Functions
}

export type NumericInput =
  | number
  | bigint
  | string
  | { valueOf: () => number | bigint; options?: Record<string, unknown> }

export interface DefaultFunctions {
  string: MessageFunction<Record<string, unknown>, unknown, 'string'>

  number: MessageFunction<
    Partial<
      Intl.NumberFormatOptions &
        Intl.PluralRulesOptions & { select?: 'exact' | 'cardinal' | 'ordinal' }
    >,
    NumericInput,
    'number'
  >

  integer: MessageFunction<
    Partial<{
      minimumIntegerDigits: number
      maximumSignificantDigits: number
      select: 'exact' | 'cardinal' | 'ordinal'
      signDisplay: Intl.NumberFormatOptions['signDisplay']
      useGrouping: Intl.NumberFormatOptions['useGrouping']
    }>,
    NumericInput,
    'number'
  >

  currency: MessageFunction<
    Partial<Intl.NumberFormatOptions> & {
      currency?: string
      currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name'
      currencySign?: 'standard' | 'accounting'
    },
    NumericInput,
    'number'
  >

  percent: MessageFunction<
    Partial<{
      minimumFractionDigits: number
      maximumFractionDigits: number
      minimumSignificantDigits: number
      maximumSignificantDigits: number
      roundingMode: string
      roundingPriority: string
      signDisplay: Intl.NumberFormatOptions['signDisplay']
      trailingZeroDisplay: string
      useGrouping: Intl.NumberFormatOptions['useGrouping']
    }>,
    NumericInput,
    'number'
  >

  offset: MessageFunction<
    Partial<
      Intl.NumberFormatOptions & {
        offset?: number
        add?: number
        subtract?: number
      }
    >,
    NumericInput,
    'number'
  >
}

export type Locale = Register extends { locale: infer RegisteredLocale } ? RegisteredLocale : string
export type Messages = Register extends { messages: infer RegisteredMessages }
  ? RegisteredMessages
  : DefaultMessages
export type Functions = Register extends { functions: infer RegisteredFunctions }
  ? RegisteredFunctions & DefaultFunctions
  : DefaultFunctions

export type MessageKey = keyof Messages

export type InferFunctionInput<FunctionName extends keyof Functions> =
  Functions[FunctionName] extends MessageFunction<any, infer Input> ? Input : undefined

export type MessageValues<Key extends MessageKey> = {
  [Value in keyof Messages[Key]]: Messages[Key][Value] extends {
    __fn: infer FunctionName extends keyof Functions
  }
    ? InferFunctionInput<FunctionName>
    : Messages[Key][Value] extends string
      ? Messages[Key][Value]
      : DefaultMessageValue
}
