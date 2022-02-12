import { Weekday } from "./complex/weekday";

export class Timestamp {
    day: Weekday;
    time: string;

    constructor(day: Weekday, time: string) {
        this.day = day;
        this.time = time;
    }
}