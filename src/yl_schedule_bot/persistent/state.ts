import IPersistent from "../../interfaces/IPersistent";
import { Timestamp } from "../../utils/timestamp";
import { TIMESTAMP_FORMAT } from "../consts";
import moment, { Moment } from "moment";
import fs from "fs/promises";
import { Store } from ".";

export default class State implements IPersistent {
    path: string;

    isRestored = false;
    notificationMessageId: number | null = null;
    isFinalTableMade = false;
    week: {
        start: Moment;
        end: Moment;
    };
    wish: {
        start: Moment | null;
        end: Moment | null;
    };

    constructor(path: string) {
        this.path = path;
        this.week = {
            start: moment().startOf("week"),
            end: moment().endOf("week")
        };
        this.wish = {
            start: null,
            end: null
        };
    }

    static getNewerState(a?: State, b?: State) {
        if(a && b) return a.week.start.isSameOrAfter(b.week.end) ? a : b;
        else if(a || b) return (a ?? b)!;
        else throw new Error("Both compared states are invalid");
    }

    static from(raw: Partial<State>) {
        const state = Object.create(State.prototype) as State;

        state.isRestored = true;
        state.notificationMessageId = raw?.notificationMessageId ?? null;
        state.isFinalTableMade = raw?.isFinalTableMade ?? false;
        state.week = {
            start: moment(raw.week?.start),
            end: moment(raw.week?.end)
        };

        return state;
    }

    private getTimestamp(start: Moment, { day, time }: Timestamp) {
        const timestamp = moment(time, TIMESTAMP_FORMAT);
        return (
            moment(start)
                .weekday(day)
                .hours(timestamp.hours())
                .minutes(timestamp.minutes())
                .seconds(timestamp.seconds())
        );
    }

    actualize({ start, end }: Store) {
        if(start && end) {
            this.wish.start = this.getTimestamp(this.week.start, start);
            this.wish.end = this.getTimestamp(this.week.start, end);
        } else {
            this.wish.start = null;
            this.wish.end = null;
        }

        return this;
    }

    update(state: Partial<State>) {
        this.isRestored = state.isRestored ?? this.isRestored;
        this.notificationMessageId = state.notificationMessageId ?? this.notificationMessageId;
        this.isFinalTableMade = state.isFinalTableMade ?? this.isFinalTableMade;
        this.week = state.week ?? this.week;

        return this;
    }

    async load() {
        try {
            const state = JSON.parse((await fs.readFile(this.path)).toString());
            this.update(State.getNewerState(this, State.from(state)));
        } catch(e) {}
    }

    async save() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { path, isRestored, ...state } = this;
        await fs.writeFile(this.path, JSON.stringify(state, null, 4));
    }

    async updateAndSave(data: Partial<State>) {
        this.update(data);
        await this.save();
    }

    async actualizeAndSave(store: Store) {
        this.actualize(store);
        await this.save();
    }
}