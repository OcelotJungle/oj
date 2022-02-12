import { AdminChat, CommonChat, CourierChat, WAChat } from "./chats";
import { DbContainer } from "./types/db-container";
import { State, Store } from "./persistent";
import { MODULE_NAME } from "./consts";
import { getUser } from "./middleware";
import { Telegraf } from "telegraf";
import { ObjectId } from "mongodb";
import { User } from "./models";

import fs from "fs/promises";
import path from "path";

export default class YLScheduleBot {
    fwd: string;
    paths: {
        store: string;
        state: string;
        excel: string;
    };
    chats!: {
        common: CommonChat,
        admin: AdminChat,
        courier: CourierChat,
        wa: WAChat
    }
    bot!: Telegraf;
    db!: DbContainer;
    store!: Store;
    state!: State;

    constructor() {
        const {
            DYNAMIC_FILES_FOLDER,
            PERSISTENT_STATE_FILE_NAME,
            PERSISTENT_STORE_FILE_NAME,
            YL_SCHEDULE_BOT_TOKEN,
            YL_SCHEDULE_BOT_XLSX_FILE_NAME
        } = process.env;
        
        if(!YL_SCHEDULE_BOT_TOKEN?.length) throw new Error("YL Schedule Bot token is not set");
        if(!YL_SCHEDULE_BOT_XLSX_FILE_NAME?.length) throw new Error("YL Schedule Bot xlsx file name is not set");

        this.fwd = path.join(process.cwd(), DYNAMIC_FILES_FOLDER!, MODULE_NAME);
        this.paths = {
            store: path.join(this.fwd, PERSISTENT_STORE_FILE_NAME!),
            state: path.join(this.fwd, PERSISTENT_STATE_FILE_NAME!),
            excel: path.join(this.fwd, YL_SCHEDULE_BOT_XLSX_FILE_NAME!)
        }

        this.store = new Store(this.paths.store);
        this.state = new State(this.paths.state);
        
        this.bot = new Telegraf(YL_SCHEDULE_BOT_TOKEN!);
    }

    async preinit() {
        const db = global.dbs.ylScheduleBot;
        this.db = {
            registry: db.collection("registry"),
            archive: db.collection("archive"),
            wishes: db.collection("wishes"),
        };

        try { await fs.mkdir(this.fwd) }
        catch(e) {}

        this.chats = {
            common: new CommonChat(this),
            admin: new AdminChat(this),
            courier: new CourierChat(this),
            wa: new WAChat(this)
        };

        await this.store.load();
        await this.store.save();

        await this.state.load();
        this.state.actualize(this.store);
        await this.state.save();

        return this;
    }

    async updateUser(_id: ObjectId, data: Partial<User>) {
        await this.db.registry.updateOne({ _id }, { $set: data });
    }

    async init() {
        this.bot.use(getUser);

        this.chats.common._init();
        await this.chats.admin._init();
        await this.chats.courier._init();
        // this.chats.wa._init();

        return this;
    }

    async start() {
        await this.bot.launch();

        return this;
    }

    async stop(reason?: string) {
        await this.store.save();
        await this.state.save();

        this.bot.stop(reason);

        return this;
    }
}