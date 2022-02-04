import { capitalize } from "../utils/common";
import { bound } from "../utils/math";

export enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

// export const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export const weekdays: { [key: string]: Weekday } = {
    "пн": Weekday.MONDAY,
    "вт": Weekday.TUESDAY,
    "ср": Weekday.WEDNESDAY,
    "чт": Weekday.THURSDAY,
    "пт": Weekday.FRIDAY,
    "сб": Weekday.SATURDAY,
    "вс": Weekday.SUNDAY
}

export class Day {
    weekday!: Weekday;
    start: number = 0;
    end: number = 0;
    isWeekend: boolean = true;

    constructor(data: any) {
        if(typeof data === "string") this._fromString(data);
        else if(typeof data === "object") this._fromObject(data);
    }

    private _fromString(data: string) {
        const matches = /^(\p{L}{2}),? (.+?)$/ugi.exec(data);
        
        this.weekday = weekdays[matches![1].toLowerCase()];
        
        const timeMatches = /(\d{1,2}(?::[30]0)?)-(\d{1,2}(?::[30]0)?)/.exec(matches![2]);
        if(timeMatches) {
            this.start = this._parseTime(timeMatches[1]);
            this.end = this._parseTime(timeMatches[2]);
            this.isWeekend = false;
        }
    }

    private _fromObject(data: any) {
        this.weekday = data.weekday ?? 0;
        this.start = data.start ?? 0;
        this.end = data.end ?? 0;
        this.isWeekend = data.isWeekend ?? true;
    }

    private _parseTime(raw: string): number {
        const int = +raw.split(":")[0];
        return bound(raw.includes(":30") ? int + 0.5 : int, 7.5, 24);
    }

    private _toString(time: number): string {
        if(Number.isInteger(time)) return `${time}`;
        else return `${Math.floor(time)}:30`;
    }

    private _getDayName(): string {
        for(const weekday in weekdays) if(weekdays[weekday] === this.weekday) return weekday;
        return "";
    }

    toString(): string {
        const time = this.isWeekend ? "выходной" : `${this._toString(this.start)}-${this._toString(this.end)}`;
        return `${capitalize(this._getDayName())}, ${time}`;
    }
}

export default class Wish {
    name: string;
    days: Day[] = [];
    isWeekend: boolean = false;

    constructor(name: string, days: string[]) {
        this.name = name.split(" ").slice(0, 2).map(v => capitalize(v.toLowerCase())).join(" ");

        for(const _day of days) {
            const day = new Day(_day);
            this.days[day.weekday] = day;
        }
        for(let i = 0; i < 7; i++) this.days[i] ??= new Day({ weekday: i });

        this.days.forEach(day => this.isWeekend &&= day.isWeekend);
    }

    static from(data: any): Wish {
        const wish = new Wish(data.name, []);
        wish.days = data.days;
        wish.isWeekend = data.isWeekend;
        return wish;
    }

    toString(): string {
        return `${this.name}${this.days.map(day => `\n${day.toString()}`).join("")}`;
    }
}