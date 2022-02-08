import { Collection } from "mongodb";

export type DbContainer = {
    registry: Collection,
    archive: Collection,
    wishes: Collection,
}