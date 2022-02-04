import { getUser, isAdmin, isDialogue } from "./middleware";
import { Collection, ObjectId } from "mongodb";
import { Context, Telegraf } from "telegraf";
import toExcelFile from "./excel-module";
import User, { Role } from "./user";
import Store from "./store";
import State from "./state";
import Wish from "./wish";

import path from "path";
import fs from "fs/promises";

const ADMIN = "ocelotjungle"
const ADMIN_TG = `@${ADMIN}`;

const MODULE_NAME = "yl_schedule_bot";

export default class YLScheduleBot {
    fwd: string;
    paths: {
        store: string;
        state: string;
        excel: string;
    };
    bot!: Telegraf;
    db!: {
        registry: Collection,
        archive: Collection,
        wishes: Collection,
    };
    store!: Store;
    state!: State;

    constructor() {
        this.fwd = path.join(process.cwd(), process.env.DYNAMIC_FILES_FOLDER, MODULE_NAME);
        this.paths = {
            store: path.join(this.fwd, process.env.PERSISTENT_STORE_FILE_NAME),
            state: path.join(this.fwd, process.env.PERSISTENT_STATE_FILE_NAME),
            excel: path.join(this.fwd, process.env.YL_SCHEDULE_BOT_XLSX_FILE_NAME)
        }

        try {
            this.bot = new Telegraf(process.env.YL_SCHEDULE_BOT_TOKEN);
            console.log("YL Schedule Bot started successfully.");
        } catch(e) {
            console.error("--------------------------------------------------");
            console.error("YL Schedule Bot start failed, error:");
            console.error(e);
            console.error("--------------------------------------------------");
        }
    }

    async preinit() {
        await this._initDB();
        await this._initFolder();
        await this._initStore();
        await this._initState();

        return this;
    }

    private async _initDB() {
        const db = global.dbs.ylScheduleBot;
        this.db = {
            registry: db.collection("registry"),
            archive: db.collection("archive"),
            wishes: db.collection("wishes"),
        };
    }

    private async _initFolder() {
        try { fs.access(this.fwd) }
        catch(e) { fs.mkdir(this.fwd) }
    }

    private async _initStore() {
        try {
            const savedStore = await fs.readFile(this.paths.store);
            this.store = new Store(JSON.parse(savedStore.toString()));
        } catch(e) { this.store = new Store() }

        await this._saveStore();
    }

    private async _updateStore(data: any) {
        Object.assign(this.store, data);
        await this._saveStore();
    }

    private async _initState() {
        try {
            const savedState = await fs.readFile(this.paths.state);
            this.state = State.getNewerState(new State(), new State(JSON.parse(savedState.toString())));
        } catch(e) { this.state = new State() }

        await this._saveState();
    }

    private async _updateState(data: any) {
        Object.assign(this.state, data);
        await this._saveState();
    }

    private async _updateUser(_id: ObjectId, data: any) {
        await this.db.registry.updateOne({ _id }, { $set: data });
    }

    init() {
        this._initCommonChat();
        this._initAdminChat();
        this._initCourierChat();
        this._initWAChat();

        return this;
    }

    private _initCommonChat() {
        this.bot.command("start", isDialogue, getUser, async ctx => {
            const user: User = ctx.state.user;
            if(!user) return await ctx.reply(`Вас нет в базе, напишите ${ADMIN_TG}.`);

            await this._updateUser(user._id!, { chatId: ctx.message.chat.id });

            await ctx.reply(`@${user.username}, ${user.name}, ${user.roles.map(role => Role.list[role]).join("/")}.`);
            await ctx.reply(`Если есть ошибка, напишите ${ADMIN_TG}.`);
        });
    }

    private _initAdminChat() {
        // this.bot.command("init", async ctx => {
        //     if(ctx.message.chat.type !== "group") return;

        //     const user = await this._getUser(ctx);
        //     if(!user?.isAdmin()) return;

        //     const id = ctx.message.chat.id;

        //     await this._updateStore({ whGroupChatId: id });
            
        //     await ctx.reply(`Бот запущен, id чата = ${id}.`);
        // });

        // this.bot.hears(/^начало/ugi, async ctx => {
        //     if(ctx.message.chat.type !== "private") return;

        //     const user = await this._getUser(ctx);
        //     if(!user?.isAdmin()) return;

        //     const matches = /^начало.? (\p{L}{2}),? (\d{1,3})/ugi.exec(ctx.message.text);
        //     if(matches?.length !== 3) return await ctx.reply("Неправильный ввод.");

            
        // });

        this.bot.command("add", isDialogue, isAdmin, async ctx => {
            console.log(ctx.message.text);

            const msg = ctx.message.text.replace(/^\/add /gi, "").split(/,\s?/);

            const user = new User({
                username: msg[0].replace("@", ""),
                name: msg[1],
                type: msg[2],
                roles: msg[3].split("/")
            });

            await this.db.registry.insertOne(user);
        });

        // Wishes in a standard form
        this.bot.hears(/(\p{L}+? \p{L}+?)\s*(\n\p{L}{2},? (.+))+/ugi, isDialogue, isAdmin, async ctx => {
            const [name, ...days] = ctx.message.text.split("\n");
            const wish = new Wish(name, days);

            await ctx.reply(wish.toString());

            await this.db.wishes.deleteMany({ name: wish.name });
            await this.db.wishes.insertOne(wish);
        });

        this.bot.command("drop", isDialogue, isAdmin, async ctx => {
            if(await this.db.wishes.estimatedDocumentCount() !== 0) await this.db.wishes.drop();
            await ctx.reply("БД пожеланий сброшена.");
        });

        this.bot.command("build", isDialogue, isAdmin, async ctx => {
            if(await this.db.wishes.estimatedDocumentCount() === 0) return;

            const _wishes = await this.db.wishes.find().toArray();

            await this.db.archive.insertOne({
                timestamp: new Date().toISOString(),
                wishes: _wishes.map(({ _id, ...wish }) => wish)
            });

            await toExcelFile(await Promise.all(_wishes.map(async wish => {
                const courier = await this.db.registry.findOne({ name: wish.name });
                return { ...Wish.from(wish), type: courier?.type ?? "bike" };
            })), this.paths.excel);
            await ctx.telegram.sendDocument(ctx.chat.id, { source: this.paths.excel });
        });
    }

    private _initCourierChat() {}
    private _initWAChat() {}

    start() {
        this.bot.launch();

        return this;
    }

    private async _saveFile(path: string, data: object) { await fs.writeFile(path, JSON.stringify(data, null, 4)) }
    private async _saveStore() { await this._saveFile(this.paths.store, this.store) }
    private async _saveState() { await this._saveFile(this.paths.state, this.state) }

    async stop(reason?: string) {
        await this._saveState();
        this.bot.stop(reason);

        return this;
    }
}