export enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

export class Timestamp {
    day: Weekday;
    hour: number;

    constructor(day: Weekday, hour: number) {
        this.day = day;
        this.hour = hour;
    }
}