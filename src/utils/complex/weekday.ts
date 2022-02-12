export enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

export type WeekdayInfo = {
    day: Weekday;
    data: {
        index: number;
        abbrs: string[];
        names: string[];
    }
}

type Info = number | string | Weekday;

export class Weekdays {
    private static readonly wds: WeekdayInfo[] = [
        {
            day: Weekday.MONDAY,
            data: {
                index: 0,
                abbrs: ["пн", "mon"],
                names: ["понедельник", "monday"]
            }
        },
        {
            day: Weekday.TUESDAY,
            data: {
                index: 1,
                abbrs: ["вт", "tue"],
                names: ["вторник", "tuesday"]
            }
        },
        {
            day: Weekday.WEDNESDAY,
            data: {
                index: 2,
                abbrs: ["ср", "wed"],
                names: ["среда", "wednesday"]
            }
        },
        {
            day: Weekday.THURSDAY,
            data: {
                index: 3,
                abbrs: ["чт", "thu"],
                names: ["четверг", "thursday"]
            }
        },
        {
            day: Weekday.FRIDAY,
            data: {
                index: 4,
                abbrs: ["пт", "fri"],
                names: ["пятница", "friday"]
            }
        },
        {
            day: Weekday.SATURDAY,
            data: {
                index: 5,
                abbrs: ["сб", "sat"],
                names: ["суббота", "saturday"]
            }
        },
        {
            day: Weekday.SUNDAY,
            data: {
                index: 6,
                abbrs: ["вс", "sun"],
                names: ["воскресенье", "sunday"]
            }
        }
    ];

    static get(info: Info, fallback = true) {
        return this._get(info) ?? (fallback ? this._get(0) : undefined);
    }
    static _get(info: Info) {
        switch(typeof info) {
            case "number": return this._index(info);
            case "string": return this._abbr(info) ?? this._name(info);
            default: return this._weekday(info);
        }
    }
    static _index(index: number) { return this.wds[index] }
    static _weekday(weekday: Weekday) { return this.wds.find(wd => wd.day === weekday)! }
    static _abbr(abbr: string) { return this.wds.find(wd => wd.data.abbrs.includes(abbr.toLowerCase())) }
    static _name(name: string) { return this.wds.find(wd => wd.data.names.includes(name.toLowerCase())) }

    static getIndex(info: Info) { return this.get(info, true)!.data.index }
    static getRuAbbr(info: Info) { return this.get(info, true)!.data.abbrs[0] }
    static getRuName(info: Info) { return this.get(info, true)!.data.names[0] }
}