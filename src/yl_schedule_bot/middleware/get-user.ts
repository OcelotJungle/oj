import { plainToInstance } from "class-transformer";
import { Context } from "telegraf";
import { User } from "../models";

export default async function getUser(ctx: Context, next: () => Promise<void>) {
    if(!ctx.message) return;
    
    if(ctx.state.user === undefined) {
        const username = ctx.message!.from.username;
        const registry = global.dbs.ylScheduleBot.collection("registry");
        ctx.state.user = plainToInstance(User, await registry.findOne({ username }));
    }

    next();
}