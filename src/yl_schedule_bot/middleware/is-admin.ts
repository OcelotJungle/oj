import { Context } from "telegraf";
import { getUser } from ".";

export default async function isAdmin(ctx: Context, next: () => Promise<void>) {
    await getUser(ctx);
    if(ctx.state.user?.isAdmin) next();
}