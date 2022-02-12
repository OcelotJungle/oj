/* eslint-disable @typescript-eslint/no-var-requires */
require("moment/locale/ru");
require("moment").locale("ru");

import "./utils/common";

import YLScheduleBot from "./yl_schedule_bot";
import { connect } from "./utils/mongo";

import fs from "fs/promises";
import path from "path";

class Controller {
    fwd!: string;
    ylScheduleBot!: YLScheduleBot;

    async preinit(config?: { dev: boolean }) {
        const envFileName = `${(config?.dev ?? false) ? ".dev" : ""}.env`;
        (await import("dotenv")).config({ path: path.join(process.cwd(), envFileName) });

        this.validateEnv();

        this.fwd = path.join(process.cwd(), process.env.DYNAMIC_FILES_FOLDER!);

        this.ylScheduleBot = new YLScheduleBot();

        process.once("SIGINT", async () => await this.stop("SIGINT"));
        process.once("SIGTERM", async () => await this.stop("SIGTERM"));
    }

    private validateEnv() {
        if(!process.env.DYNAMIC_FILES_FOLDER?.length)
            throw new Error("Dynamic files folder is not set");
        if(!process.env.PERSISTENT_STATE_FILE_NAME?.length)
            throw new Error("Persistent state file name is not set");
        if(!process.env.PERSISTENT_STORE_FILE_NAME?.length)
            throw new Error("Persistent store file name is not set");
    }

    async init() {
        global.dbs = (await connect()).dbs;

        try { await fs.mkdir(this.fwd) }
        catch(e) {}

        await this.try("YL Schedule Bot", async () => await (await this.ylScheduleBot.preinit()).init());
    }

    private async try(name: string, func: () => Promise<unknown>) {
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
    const dev = process.argv.includes("dev");
    const controller = new Controller();
    await controller.preinit({ dev });
    await controller.init();
    await controller.start();
})();