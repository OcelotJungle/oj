import { MongoClient } from "mongodb";

// const DB_URI = process.env.DB_URI ?? "";
const {
    DB_URI = "",
    YL_SCHEDULE_BOT_DB_NAME = ""
} = process.env;

if(!(DB_URI && DB_URI.length)) throw new Error("DB uri is invalid.");
if(!(YL_SCHEDULE_BOT_DB_NAME && YL_SCHEDULE_BOT_DB_NAME.length)) throw new Error("YL schedule bot db name is invalid.");

// global.mongo ??= null;

export async function connect() {
    if(!global.mongo) {
        const client = await MongoClient.connect(DB_URI);
        
        global.mongo = {
            client,
            dbs: {
                ylScheduleBot: client.db(YL_SCHEDULE_BOT_DB_NAME)
            }
        };
    }

    return global.mongo;
}