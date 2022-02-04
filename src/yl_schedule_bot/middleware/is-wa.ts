import { Context } from "telegraf";
import { getUser } from ".";

export default async function isWA(ctx: Context, next: () => Promise<void>) {
    if(!ctx.state.user) await getUser(ctx, async () => void(0));
    if(ctx.state.user?.isWA()) next();
}