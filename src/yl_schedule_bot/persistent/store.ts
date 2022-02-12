import IPersistent from "../../interfaces/IPersistent";
import { Timestamp } from "../../utils/timestamp";
import fs from "fs/promises";

export default class Store implements IPersistent {
    path: string;

    whGroupChatId: number | null = null;
    start: Timestamp | null = null;
    end: Timestamp | null = null;

    constructor(path: string) { this.path = path }

    static from(raw: Partial<Store>) {
        const store = Object.create(Store.prototype) as Store;

        store.whGroupChatId = raw.whGroupChatId ?? null;
        store.start = raw.start ? new Timestamp(raw.start.day, raw.start.time) : null;
        store.end = raw.end ? new Timestamp(raw.end.day, raw.end.time) : null;

        return store;
    }

    update(store: Partial<Store>) {
        if(store.whGroupChatId !== undefined) this.whGroupChatId = store.whGroupChatId;
        if(store.start !== undefined) this.start = store.start;
        if(store.end !== undefined) this.end = store.end;
    }

    async load() {
        try {
            const store = JSON.parse((await fs.readFile(this.path)).toString());
            this.update(Store.from(store));
        } catch(e) {}
    }

    async save() {
        const { path, ...store } = this;
        await fs.writeFile(this.path, JSON.stringify(store, null, 4));
    }

    async updateAndSave(data: Partial<Store>) {
        this.update(data);
        await this.save();
    }
}