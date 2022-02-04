import { Context } from "telegraf";
import User from "../user";

export default async function getUser(ctx: Context, next: () => Promise<void>) {
    const user = await global.dbs.ylScheduleBot.collection("registry").findOne({ username: ctx.message!.from.username });
    ctx.state.user = user ? new User(user) : null;
    next();
}