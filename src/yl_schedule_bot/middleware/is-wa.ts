import { Context } from "telegraf";

export default async function isWA(ctx: Context, next: () => Promise<void>) {
    if(ctx.state.user?.isWA) next();
}