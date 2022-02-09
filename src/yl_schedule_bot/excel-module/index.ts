import CourierType from "../enums/courier-type";
import WeekdayStats from "./weekday-stats";
import ExcelWorker from "./excel-worker";
import { DAYS_IN_WEEK } from "../consts";
import Wish from "../models/wish";
import Courier from "./courier";

function getCouriers(wishes: Wish[]) {
    return wishes
        .filter(wish => !wish.schedule.isWeekend)
        .map(({ courier: { name, type }, schedule: { days } }) => new Courier(name, days, type))
        .sort((a, b) => b.total - a.total)
        .sort((a, b) => {
            if(a.type !== b.type) {
                if(a.type === CourierType.CAR) return -1;
                if(b.type === CourierType.CAR) return 1;
            }
            return 0;
        })
}

function getWeekdays(couriers: Courier[]) {
    return new Array(DAYS_IN_WEEK).fill(42).map((_, i) => {
        return couriers.reduce((weekday, { days }) => {
            if(!days[i].isWeekend) {
                weekday.total++;
                if(days[i].isMorning) weekday.morning++;
                if(days[i].isEvening) weekday.evening++;
            }
            return weekday;
        }, new WeekdayStats());
    });
}

export default async function exportToExcel(wishes: Wish[], pathToSave: string) {
    const couriers = getCouriers(wishes);
    const weekdays = getWeekdays(couriers);

    await new ExcelWorker().fill(couriers, weekdays).save(pathToSave);
}