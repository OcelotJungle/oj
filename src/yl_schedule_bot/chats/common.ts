import { plainToInstance } from "class-transformer";
import { getUser, isDialogue } from "../middleware";
import { ADMIN_TG, } from "../consts";
import { Telegraf } from "telegraf";
import { User } from "../models";
import YLScheduleBot from "..";
import Chat from "./chat";

export default class CommonChat extends Chat {
    master: YLScheduleBot;
    bot: Telegraf;

    constructor(master: YLScheduleBot) {
        super();
        this.master = master;
        this.bot = this.master.bot;
    }

    _init() {
        this.start();
    }

    private start() {
        this.bot.command("start", isDialogue, getUser, async ctx => {
            if(!ctx.state.user) return await ctx.reply(`Вас нет в базе, напишите ${ADMIN_TG}.`);
            
            const user = plainToInstance(User, ctx.state.user);
            
            await this.master.updateUser(user._id!, { chatId: ctx.message.chat.id });

            await ctx.reply(`${user.toString()}.`);
            await ctx.reply(`Если есть ошибка, напишите ${ADMIN_TG}.`);
        });
    }
}