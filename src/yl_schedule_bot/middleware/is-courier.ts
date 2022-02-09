import { Context } from "telegraf";

export default async function isCourier(ctx: Context, next: () => Promise<void>) {
    if(ctx.state.user?.isCourier) next();
}