import { iterateWeek } from "../utils";
import { WishDay } from ".";

export default class Schedule {
    days: WishDay[] = [];

    get isWeekend() { return this.days.filter(day => !day.time.isWeekend).length !== 0 }

    static parse(days: string[]) {
        const schedule = new Schedule();

        for(const raw of days) {
            const day = new WishDay(raw);
            schedule.days[day.weekday] = day;
        }
        iterateWeek(day => schedule.days[day] ??= WishDay.getEmptyWeekday(day));

        return schedule;
    }
}