import { Db, MongoClient } from "mongodb";

type Dbs = {
    ylScheduleBot: Db;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_URI: string;
            DYNAMIC_FILES_FOLDER: string;
            PERSISTENT_STORE_FILE_NAME: string;
            PERSISTENT_STATE_FILE_NAME: string;
            YL_SCHEDULE_BOT_TOKEN: string;
            YL_SCHEDULE_BOT_DB_NAME: string;
            YL_SCHEDULE_BOT_XLSX_FILE_NAME: string;
        }
    };
    var mongo: {
        client: MongoClient,
        dbs: Dbs
    };
    var dbs: Dbs;
}