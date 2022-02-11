import { ADMIN_TG, WISH_LINE_REGEXP_ANY, WISH_LINE_REGEXP_WORK } from "../consts";
import { isCourier, isDialogue } from "../middleware";
import { plainToInstance } from "class-transformer";
import { DbContainer } from "../types/db-container";
import { Schedule, Wish } from "../models";
import { Telegraf } from "telegraf";
import YLScheduleBot from "..";
import Chat from "./chat";

export default class CourierChat extends Chat {
    master: YLScheduleBot;
    bot: Telegraf;
    db: DbContainer;

    constructor(master: YLScheduleBot) {
        super();
        this.master = master;
        this.bot = this.master.bot;
        this.db = this.master.db;
    }

    _init() {
        this.addWish();
    }
    
    private addWish() {
        // Wishes in a standard form (without name)
        const wishesRegExp = new RegExp(`\\s*(${WISH_LINE_REGEXP_ANY}\\s*\\n?)+`, "ugi");
        this.bot.hears(wishesRegExp, isDialogue, isCourier, async ctx => {
            const msg = ctx.message.text.trim().split("\n");

            const days = (msg
                .map(v => v.trim())
                .map(v => v.replace(/\s+/g, " "))
                .filter(v => new RegExp(WISH_LINE_REGEXP_WORK, "ugi").test(v))
            );

            const wish = plainToInstance(Wish, {
                courier: ctx.state.user,
                schedule: Schedule.parse(days)
            });

            await this.db.wishes.deleteMany({ "courier._id": ctx.state.user._id });
            await this.db.wishes.insertOne(wish);

            await ctx.reply(
                `Записано:\n\n${wish.toString()}\n\n` +
                "Если есть ошибка, проверьте правильность ввода пожеланий.\n" +
                `Если всё верно, но результат неправильный, напишите ${ADMIN_TG}.`,
                { reply_to_message_id: ctx.message.message_id }
            );
        })
    }
}