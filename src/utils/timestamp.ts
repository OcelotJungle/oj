import { Weekday } from "./complex/weekday";

export class Timestamp {
    day: Weekday;
    hour: number;

    constructor(day: Weekday, hour: number) {
        this.day = day;
        this.hour = hour;
    }
}