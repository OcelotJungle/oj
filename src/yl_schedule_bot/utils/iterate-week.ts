import { DAYS_IN_WEEK } from "../consts";

export default function iterateWeek(fn: (day: number) => any, start: number = 0, offset: number = 0) {
    for(let i = start; i < DAYS_IN_WEEK + offset; i++) fn(i);
}