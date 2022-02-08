import { MAX_MORNING_START_TIME, MIN_EVENING_END_TIME, WEEKEND_TEXT } from "../consts";

export default class WorkingTime {
    start: number;
    end: number;

    get duration() { return this.end - this.start }
    get isMorning() { return this.start <= MAX_MORNING_START_TIME }
    get isEvening() { return this.end >= MIN_EVENING_END_TIME }
    get isWeekend() { return this.start === 0 || this.end === 0 }

    constructor(start?: string | number, end?: string | number) {
        this.start = this.parse(start);
        this.end = this.parse(end);
    }

    private parse(raw: string | number | undefined) {
        if(!raw) return 0;
        if(typeof raw === "number") return raw;

        const matches = /(\d{1,2})(:[30]0)?/.exec(raw);
        return matches ? Math.bound(+matches[1] + (matches[2] ? 0.5 : 0), 7.5, 24) : 0;
    }

    private stringify(time: number) {
        if(Number.isInteger(time)) return `${time}`;
        else return `${Math.floor(time)}:30`;
    }

    toString() {
        return this.isWeekend ? WEEKEND_TEXT : `${this.stringify(this.start)}-${this.stringify(this.end)}`;
    }
}