import { Moment } from "moment";

export function setMomentTime(moment: Moment, time: string) {
    const [hours, minutes, seconds] = time.split(":").map(v => !Number.isNaN(+v) ? +v : 0);
    return moment.hours(hours).minutes(minutes).seconds(seconds).milliseconds(0);
}