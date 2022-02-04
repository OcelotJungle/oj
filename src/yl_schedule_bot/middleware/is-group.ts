import { Context } from "telegraf";

export default async function isGroup(ctx: Context, next: () => Promise<void>) {
    if(ctx.message?.chat.type === "group") next();
}