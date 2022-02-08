import { Context } from "telegraf";
import { getUser } from ".";

export default async function isWA(ctx: Context, next: () => Promise<void>) {
    await getUser(ctx);
    if(ctx.state.user?.isWA) next();
}