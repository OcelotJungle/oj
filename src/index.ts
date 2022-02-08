require("dotenv").config();
require("moment/locale/ru");
require("moment").locale("ru");

import "./utils/common";

import YLScheduleBot from "./yl_schedule_bot";
import { connect } from "./utils/mongo";

import fs from "fs/promises";
import path from "path";

class Controller {
    fwd: string;
    ylScheduleBot: YLScheduleBot;

    constructor() {
        if(!process.env.DYNAMIC_FILES_FOLDER?.length) throw new Error("Dynamic files folder is not set");
        if(!process.env.PERSISTENT_STATE_FILE_NAME?.length) throw new Error("Persistent state file name is not set");
        if(!process.env.PERSISTENT_STORE_FILE_NAME?.length) throw new Error("Persistent store file name is not set");

        this.fwd = path.join(process.cwd(), process.env.DYNAMIC_FILES_FOLDER);

        this.ylScheduleBot = new YLScheduleBot();

        process.once("SIGINT", async () => await this.stop("SIGINT"));
        process.once("SIGTERM", async () => await this.stop("SIGTERM"));
    }

    async init() {
        global.dbs = (await connect()).dbs;

        try { await fs.mkdir(this.fwd) }
        catch(e) {}

        await this.try("YL Schedule Bot", async () => (await this.ylScheduleBot.preinit()).init());
    }

    private async try(name: string, func: () => Promise<any>) {
        try {
            func();
            console.log(`${name} started successfully.`);
        } catch(e) {
            console.error("------------------------------");
            console.error(`${name} start failed, error:`);
            console.error(e);
            console.error("------------------------------");
        }
    }

    async start() {
        await this.ylScheduleBot.start();
    }

    async stop(reason?: string) {
        await this.ylScheduleBot.stop(reason);
    }
}

(async () => {
    const controller = new Controller();
    await controller.init();
    await controller.start();
})();