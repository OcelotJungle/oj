import IPersistent from "../../interfaces/IPersistent";
import { Timestamp } from "../../utils/timestamp";
import fs from "fs/promises";

export default class Store implements IPersistent {
    path!: string;

    whGroupChatId?: number;
    start?: Timestamp;
    end?: Timestamp;

    constructor(path: string) { this.path = path }

    static from(raw: Partial<Store>) {
        const store = Object.create(Store) as Store;

        store.whGroupChatId = raw.whGroupChatId;
        store.start = raw.start;
        store.end = raw.end;

        return store;
    }

    update(store?: Partial<Store>) {
        this.whGroupChatId = store?.whGroupChatId ?? this.whGroupChatId;
        this.start = store?.start ?? this.start;
        this.end = store?.end ?? this.end;
    }

    async load() {
        try {
            const store = JSON.parse((await fs.readFile(this.path)).toString()) as Store;
            this.update(store);
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