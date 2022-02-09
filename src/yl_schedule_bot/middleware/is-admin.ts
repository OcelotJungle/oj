import { Context } from "telegraf";

export default async function isAdmin(ctx: Context, next: () => Promise<void>) {
    if(ctx.state.user?.isAdmin) next();
}