import type { Options as PrettierOptions } from 'prettier'

import prettier from 'prettier'

export async function format(source: string, options?: boolean | PrettierOptions): Promise<string> {
  if (!options) return source

  const prettierOptions: PrettierOptions = {
    parser: 'typescript',
    ...(typeof options === 'object' ? options : {}),
  }

  return prettier.format(source, prettierOptions)
}
