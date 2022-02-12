import { Telegraf } from "telegraf";
import YLScheduleBot from "..";

export default abstract class Chat {
    abstract master: YLScheduleBot;
    abstract bot: Telegraf;

    abstract _init(): void;
    protected abstract _cmds(): void;
}