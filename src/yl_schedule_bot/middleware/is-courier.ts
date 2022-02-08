import { Context } from "telegraf";
import { getUser } from ".";

export default async function isCourier(ctx: Context, next: () => Promise<void>) {
    await getUser(ctx);
    if(ctx.state.user?.isCourier) next();
}