export default interface IPersistent {
    path: string;

    update(data: any): void;
    load(): void | never;
    save(): void | never;

    updateAndSave(data: any): void;
}