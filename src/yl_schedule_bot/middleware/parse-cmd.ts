import { Context } from "telegraf";

export default function parseCmdFactory(
    min: number = 0,
    max: number = 1000,
    separator: string | RegExp = /,\s?/
) {
    return function parseCmd(ctx: Context, next: () => Promise<void>) {
        // @ts-ignore
        ctx.state.args = (ctx.message.text as string).replace(/^\/.+? /, "").split(separator);
        if(ctx.state.args.length >= min && ctx.state.args.length <= max) next();
    }
}