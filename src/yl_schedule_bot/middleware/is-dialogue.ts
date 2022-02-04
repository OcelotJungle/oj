import { Context } from "telegraf";

export default async function isDialogue(ctx: Context, next: () => Promise<void>) {
    if(ctx.message?.chat.type === "private") next();
}