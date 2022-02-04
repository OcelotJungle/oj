require("dotenv").config();
require("moment/locale/ru");
require("moment").locale("ru");

import fs from "fs/promises";
import path from "path";

import { connect } from "./utils/mongo";

import YLScheduleBot from "./yl_schedule_bot";

class Controller {
    ylScheduleBot: YLScheduleBot;

    constructor() {
        this.ylScheduleBot = new YLScheduleBot();

        process.once("SIGINT", async () => await this.stop("SIGINT"));
        process.once("SIGTERM", async () => await this.stop("SIGTERM"));
    }

    async init() {
        global.dbs = (await connect()).dbs;

        try { await fs.mkdir(path.join(process.cwd(), process.env.DYNAMIC_FILES_FOLDER ?? "")) }
        catch(e) {}
    }

    async start() {
        (await this.ylScheduleBot.preinit()).init().start();
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