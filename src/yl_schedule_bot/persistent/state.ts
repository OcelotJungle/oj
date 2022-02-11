import IPersistent from "../../interfaces/IPersistent";
import fs from "fs/promises";
import moment from "moment";

export default class State implements IPersistent {
    path!: string;

    isRestored: boolean = false;
    notificationMessageId: number | null = null;
    isFinalTableMade: boolean = false;
    week!: {
        start: moment.Moment;
        end: moment.Moment;
    }

    constructor(path: string) {
        this.path = path;
        this.week = {
            start: moment().startOf("week"),
            end: moment().endOf("week")
        };
    }

    static getNewerState(a?: State, b?: State) {
        if(a && b) return b.week.end.diff(a.week.start, "second") <= 0 ? a : b;
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

    update(state?: Partial<State>) {
        this.isRestored = state?.isRestored ?? this.isRestored;
        this.notificationMessageId = state?.notificationMessageId ?? this.notificationMessageId;
        this.isFinalTableMade = state?.isFinalTableMade ?? this.isFinalTableMade;
        this.week = state?.week ?? this.week;
    }

    async load() {
        try {
            const state = JSON.parse((await fs.readFile(this.path)).toString());
            this.update(State.getNewerState(this, State.from(state)));
        } catch(e) {}
    }

    async save() {
        const { path, isRestored, ...state } = this;
        await fs.writeFile(this.path, JSON.stringify(state, null, 4));
    }

    async updateAndSave(data: Partial<State>) {
        this.update(data);
        await this.save();
    }
}