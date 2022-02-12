import { DAYS_IN_WEEK } from "../consts";

export default function iterateWeek(fn: (day: number) => unknown, start = 0, offset = 0) {
    for(let i = start; i < DAYS_IN_WEEK + offset; i++) fn(i);
}