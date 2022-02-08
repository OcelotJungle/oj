import { instanceToPlain, plainToInstance } from "class-transformer";
import { DbContainer } from "../types/db-container";
import { isAdmin, isDialogue } from "../middleware";
import { Schedule, User, Wish } from "../models";
import { CourierType, Role } from "../enums";
import exportToExcel from "../excel-module";
import { Telegraf } from "telegraf";
import YLScheduleBot from "..";
import Chat from "./chat";

const ADDED_INTO_DB = "Добавлено в БД:";
const NO_COURIER = "Курьера нет в БД:";
const WISHES_DB_EMPTY = "В БД пожеланий ничего нет.";
const WISHES_DB_DROPPED = "БД пожеланий сброшена.";

export default class AdminChat extends Chat {
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
        // this.init();
        // this.startAt();
        this.addUser();
        this.addWish();
        this.drop();
        this.build();
    }

    private init() {
        // this.bot.command("init", async ctx => {
        //     if(ctx.message.chat.type !== "group") return;

        //     const user = await this._getUser(ctx);
        //     if(!user?.isAdmin()) return;

        //     const id = ctx.message.chat.id;

        //     await this._updateStore({ whGroupChatId: id });
            
        //     await ctx.reply(`Бот запущен, id чата = ${id}.`);
        // });
    }

    private startAt() {
        // this.bot.hears(/^начало/ugi, async ctx => {
        //     if(ctx.message.chat.type !== "private") return;

        //     const user = await this._getUser(ctx);
        //     if(!user?.isAdmin()) return;

        //     const matches = /^начало.? (\p{L}{2}),? (\d{1,3})/ugi.exec(ctx.message.text);
        //     if(matches?.length !== 3) return await ctx.reply("Неправильный ввод.");

            
        // });
    }

    private addUser() {
        this.bot.command("add", isDialogue, isAdmin, async ctx => {
            const msg = ctx.message.text.replace(/^\/add /gi, "").split(/,\s?/);

            const user = plainToInstance(User, {
                username: msg[0].replace("@", ""),
                name: msg[1],
                type: msg[2] as CourierType,
                roles: msg[3].split("/") as Role[]
            });

            await this.db.registry.insertOne(user);

            await ctx.reply(ADDED_INTO_DB);
            await ctx.reply(`${user.toString()}, ${user.type}.`);
        });
    }

    private addWish() {
        // Wishes in a standard form
        this.bot.hears(/(\p{L}+? \p{L}+?)\s*(\n\p{L}{2},? (.+))+/ugi, isDialogue, isAdmin, async ctx => {
            const [name, ...days] = ctx.message.text.split("\n").map(v => v.trim());

            const user = await this.db.registry.findOne({ name });
            if(!user) return await ctx.reply(`${NO_COURIER} "${name}".`);

            const wish = plainToInstance(Wish, {
                courier: plainToInstance(User, user),
                schedule: Schedule.parse(days)
            });
            
            await this.db.wishes.deleteMany({ "courier._id": user._id });
            await this.db.wishes.insertOne(wish);

            await ctx.reply(ADDED_INTO_DB);
            await ctx.reply(wish.toString());
        });
    }

    private drop() {
        this.bot.command("drop", isDialogue, isAdmin, async ctx => {
            if(await this.db.wishes.estimatedDocumentCount() === 0) 
                return await ctx.reply(WISHES_DB_EMPTY);

            await this.db.wishes.drop();
            await ctx.reply(WISHES_DB_DROPPED);
        });
    }

    private build() {
        this.bot.command("build", isDialogue, isAdmin, async ctx => {
            if(await this.db.wishes.estimatedDocumentCount() === 0)
                return await ctx.reply(WISHES_DB_EMPTY);

            const wishes = plainToInstance(Wish, await this.db.wishes.find().toArray());

            await this.db.archive.insertOne({
                timestamp: new Date().toISOString(),
                wishes: instanceToPlain(wishes)
            });

            await exportToExcel(wishes, this.master.paths.excel);
            await ctx.telegram.sendDocument(ctx.chat.id, { source: this.master.paths.excel });
        });
    }
}