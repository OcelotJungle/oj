import { Telegraf } from "telegraf";
import YLScheduleBot from "..";
import Chat from "./chat";

export default class CourierChat extends Chat {
    master: YLScheduleBot;
    bot: Telegraf;

    constructor(master: YLScheduleBot) {
        super();
        this.master = master;
        this.bot = this.master.bot;
    }

    _init() {}
}