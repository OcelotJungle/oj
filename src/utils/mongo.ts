import { MongoClient } from "mongodb";


export async function connect() {
    if(!global.mongo) {
        const {
            DB_URI,
            YL_SCHEDULE_BOT_DB_NAME
        } = process.env;

        if(!DB_URI?.length) throw new Error("DB uri is invalid.");
        if(!YL_SCHEDULE_BOT_DB_NAME?.length) throw new Error("YL schedule bot db name is invalid.");

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