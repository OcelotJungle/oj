interface IPersistent {
    path: string;

    update(data: unknown): void;
    load(): void | never;
    save(): void | never;

    updateAndSave(data: unknown): void;
}

export default IPersistent;