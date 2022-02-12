import { Moment } from "moment";

export function setMomentTime(moment: Moment, time: string) {
    const [hours, minutes, seconds] = time.split(":").map(v => !Number.isNaN(+v) ? +v : undefined);
    return moment.hours(hours ?? 0).minutes(minutes ?? 0).seconds(seconds ?? 0).milliseconds(0);
}