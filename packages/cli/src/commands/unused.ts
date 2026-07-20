import type { KanjouPluginContext } from '#/shared/context'

export function unused(ctx: KanjouPluginContext) {
  return async () => {
    console.log(await ctx.getConfig())
  }
}
