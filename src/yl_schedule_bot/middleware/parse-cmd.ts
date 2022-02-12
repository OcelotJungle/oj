import { Context } from "telegraf";

export default function parseCmdFactory(
    min = 0,
    max = 1000,
    separator: string | RegExp = /,\s?/
) {
    return function parseCmd(ctx: Context, next: () => Promise<void>) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ctx.state.args = (ctx.message.text as string).replace(/^\/.+? /, "").split(separator);
        if(ctx.state.args.length >= min && ctx.state.args.length <= max) next();
    };
}