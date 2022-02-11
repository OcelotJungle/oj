import { instanceToPlain, plainToInstance } from "class-transformer";
import { DbContainer } from "../types/db-container";
import { isAdmin, isDialogue } from "../middleware";
import { Schedule, User, Wish } from "../models";
import { CourierType, Role } from "../enums";
import { WISH_LINE_REGEXP } from "../consts";
import exportToExcel from "../excel-module";
import { Telegraf } from "telegraf";
import YLScheduleBot from "..";
import Chat from "./chat";

const ADDED_INTO_DB = "Добавлено в БД:";
const NO_COURIER = "Курьера нет в БД:";
const NO_USER = "Пользователя нет в БД:";
const UNSUPPORTED_FIELD = "Неподдерживаемое поле:";
const USER_EDITED = "Пользователь изменён:";
const USER_DELETED = "Пользователь удалён:";
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
        this.getUser();
        this.addUser();
        this.editUser();
        this.deleteUser();
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

    private _parseField(key: string, raw: string): any {
        switch(key) {
            case "username": return raw.replace("@", "");
            case "name": return raw;
            case "type": return raw;
            case "roles": return raw.split("/")
        }
    }

    private getUser() {
        this.bot.command("get", isDialogue, isAdmin, async ctx => {
            const filter = ctx.message.text.replace(/^\/get /gi, "");

            const _user = await this.db.registry.findOne({
                $or: [
                    { username: this._parseField("username", filter) },
                    { name: this._parseField("name", filter) }
                ]
            });
            if(!_user) return await ctx.reply(`${NO_USER} ${filter}.`);

            const user = plainToInstance(User, _user);
            await ctx.reply(`${user.toString()}, ${user.type}.`);
        });
    }

    private addUser() {
        this.bot.command("add", isDialogue, isAdmin, async ctx => {
            const msg = ctx.message.text.replace(/^\/add /gi, "").split(/,\s?/);

            const user = plainToInstance(User, {
                username: this._parseField("username", msg[0]) as string,
                name: this._parseField("name", msg[1]) as string,
                type: this._parseField("type", msg[2]) as CourierType,
                roles: this._parseField("roles", msg[3]) as Role[]
            });

            await this.db.registry.insertOne(user);

            await ctx.reply(ADDED_INTO_DB);
            await ctx.reply(`${user.toString()}, ${user.type}.`);
        });
    }

    private editUser() {
        this.bot.command("edit", isDialogue, isAdmin, async ctx => {
            const msg = ctx.message.text.replace(/^\/edit /gi, "").split(/,\s?/);
            const username = msg[0].replace("@", "");

            const user = await this.db.registry.findOne({ username });
            if(!user) return await ctx.reply(`${NO_USER} @${username}`);

            const value = this._parseField(msg[1], msg[2]);
            if(!value) return await ctx.reply(`${UNSUPPORTED_FIELD} ${msg[1]}`);

            await this.db.registry.updateOne({ _id: user._id }, { $set: { [msg[1]]: value } });
            await ctx.reply(`${USER_EDITED} @${username} (${msg[1]} = ${value.toString()})`);
        });
    }

    private deleteUser() {
        this.bot.command("delete", isDialogue, isAdmin, async ctx => {
            const msg = ctx.message.text.replace(/^\/delete /gi, "").split(/,\s?/);
            const username = msg[0].replace("@", "");

            let answer: string;
            if(await this.db.registry.findOne({ username })) {
                await this.db.registry.deleteOne({ username });
                answer = USER_DELETED;
            } else answer = NO_USER;

            await ctx.reply(`${answer} @${username}.`);
        });
    }

    private addWish() {
        // Wishes in a standard form (with name)
        const wishesRegexp = new RegExp(`^(\\p{L}+? \\p{L}+?)\\s*(\\n${WISH_LINE_REGEXP})+`, "ugi");
        const wishesRegexp = new RegExp(`^(\\p{L}+? \\p{L}+?)\\s*(\\n${WISH_LINE_REGEXP_ANY})+`, "ugi");
        this.bot.hears(wishesRegexp, isDialogue, isAdmin, async ctx => {
            const [name, ...days] = ctx.message.text.split("\n").map(v => v.trim());

            const user = await this.db.registry.findOne({ name });
            if(!user) return await ctx.reply(`${NO_COURIER} "${name}".`);

            const wish = plainToInstance(Wish, {
                courier: plainToInstance(User, user),
                schedule: Schedule.parse(days)
            });
            
            await this.db.wishes.deleteMany({ "courier._id": user._id });
            await this.db.wishes.insertOne(wish);

            await ctx.reply(wish.toString(), { reply_to_message_id: ctx.message.message_id });
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