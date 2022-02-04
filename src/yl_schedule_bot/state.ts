import moment from "moment";

export default class State {
    restored: boolean;
    notificationMessageId: number | null;
    isFinalTableMade: boolean;
    week: {
        start: moment.Moment;
        end: moment.Moment
    }

    constructor(state?: State) {
        this.restored = state ? true : false;
        this.notificationMessageId = state?.notificationMessageId ?? null;
        this.isFinalTableMade = state ? state.isFinalTableMade : false;
        this.week = {
            start: state ? moment(state.week.start) : moment().startOf("week"),
            end: state ? moment(state.week.end) : moment().endOf("week")
        };

        // if(state) {
        //     // this.id = state.id;
        //     this.restored = true;
        //     this.notificationMessageId = state.notificationMessageId;
        //     this.isFinalTableMade = state.isFinalTableMade;
        //     this.week = {
        //         start: moment(state.week.start),
        //         end: moment(state.week.end)
        //     }
        // } else {
        //     // this.id = Math.floor(Math.random() * 1000);
        //     this.restored = false;
        //     this.notificationMessageId = null;
        //     this.isFinalTableMade = false;
        //     this.week = {
        //         start: moment().startOf("week"),
        //         end: moment().endOf("week")
        //     }
        // }
    }

    static getNewerState(a: State, b: State) {
        if(a && b) return b.week.end.diff(a.week.start, "second") < 0 ? a : b;
        else {
            if(a) return a;
            if(b) return b;
            return new State();
        }
    }
}