import { Weekday, Weekdays } from "../../utils/complex/weekday";
import { WorkingTime } from ".";

export default class WishDay {
    weekday!: Weekday;
    time!: WorkingTime;

    constructor(data?: string) {
        if(!data) return;

        const matches = /^(\p{L}{2})[,\s]\s?(.+?)$/ugi.exec(data);

        if(!(matches?.length === 3)) throw new Error(`Invalid time period: '${data}'`);

        this.weekday = this.parseWeekday(matches[1]);
        this.time = this.parseTime(matches[2]);
    }

    static getEmptyWeekday(index: number) {
        const wishDay = new WishDay();
        wishDay.weekday = Weekdays.get(index)!.day;
        wishDay.time = new WorkingTime(0, 0);
        return wishDay;
    }

    private parseWeekday(raw: string) { return Weekdays.get(raw, true)!.day }
    private parseTime(raw: string) {
        const matches = /^(.+?)-(.+?)$/.exec(raw);
        return matches ? new WorkingTime(matches[1], matches[2]) : new WorkingTime(0, 0);
    }

    private getDayAbbr() { return Weekdays.getRuAbbr(this.weekday) }

    toString() { return `${this.getDayAbbr().capitalize()}, ${this.time.toString()}` }
}