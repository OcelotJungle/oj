import { Role } from "./enums";

export const DAYS_IN_WEEK = 7;
export const EMPTY_COURIER_ROWS = 5;
export const MAX_MORNING_START_TIME = 13;
export const MIN_EVENING_END_TIME = 20;
export const CAR_COURIER_ADDITION = "(авто)";
export const WEEKEND_TEXT = "выходной";
export const ADMIN = "ocelotjungle";
export const ADMIN_TG = `@${ADMIN}`;
export const MODULE_NAME = "yl_schedule_bot";
export const ROLES: { [key in Role]: string } = {
    admin: "админ",
    courier: "курьер",
    wa: "склад"
}

const WISH_LINE_REGEXP_START = "(\\p{L}{2})[,:\\s]\\s*";
export const WISH_LINE_REGEXP_WORK = `${WISH_LINE_REGEXP_START}(.+-.+)`;
export const WISH_LINE_REGEXP_ANY = `${WISH_LINE_REGEXP_START}(.+?)`;