import { ADMIN_TG, WISH_LINE_REGEXP_ANY, WISH_LINE_REGEXP_WORK } from "../consts";
import { isCourier, isDialogue } from "../middleware";
import { plainToInstance } from "class-transformer";
import { DbContainer } from "../types/db-container";
import { Schedule, Wish } from "../models";
import { Telegraf } from "telegraf";
import { Role } from "../enums";
import YLScheduleBot from "..";
import moment from "moment";
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

    async _init() {
        // await this._cmds();
        this.addWish();
    }
    
    protected async _cmds() {
        const couriers = await this.db.registry.find({
            chatId: { $type: "number" },
            roles: Role.COURIER
        }, { projection: { _id: 0, chatId: 1 } }).toArray();

        for(const { chatId } of couriers) {
            this.bot.telegram.setMyCommands([
                { command: "notify_on", description: "- включить уведомления о начале сбора пожеланий [WIP]" },
                { command: "notify_off", description: "- выключить уведомления о начале сбора пожеланий [WIP]" }
            ], {
                scope: {
                    type: "chat",
                    chat_id: chatId
                }
            });
        }
    }
    
    private addWish() {
        enum WishTimeStatus { TOO_EARLY, TOO_LATE, OK }

        const getWishTimeStatus = () => {
            const now = moment();
            const { start, end } = this.master.state.wish;
            switch(true) {
                case now.isBefore(start): return WishTimeStatus.TOO_EARLY;
                case now.isAfter(end): return WishTimeStatus.TOO_LATE;
                default: return WishTimeStatus.OK;
            }
        };

        // Wishes in a standard form (without name)
        const wishesRegExp = new RegExp(`^\\s*(${WISH_LINE_REGEXP_ANY}\\s*\\n?)+`, "ugi");
        this.bot.hears(wishesRegExp, isDialogue, isCourier, async ctx => {
            switch(getWishTimeStatus()) {
                case WishTimeStatus.TOO_EARLY:
                    return await ctx.reply("Приём пожеланий ещё не ведётся, напишите позже.");
                case WishTimeStatus.TOO_LATE:
                    return await ctx.reply(`Приём пожеланий уже окончен, напишите ${ADMIN_TG}.`);
            }

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
        });
    }
}