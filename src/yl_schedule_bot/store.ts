import { Timestamp } from "../utils/time-things";

export default class Store {
    whGroupChatId: number | null;
    start: Timestamp | null;
    end: Timestamp | null;

    constructor(store?: Store) {
        this.whGroupChatId = store?.whGroupChatId ?? null;
        this.start = store?.start ?? null;
        this.end = store?.end ?? null;
    }
}