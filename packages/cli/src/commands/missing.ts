import type { KanjouPluginContext } from '#/shared/context'

export function missing(ctx: KanjouPluginContext) {
  return async () => {
    console.log(await ctx.getConfig())
  }
}
