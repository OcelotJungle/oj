import WorkingTime from "../models/working-time";
import CourierType from "../enums/courier-type";
import WishDay from "../models/wish-day";
import { plainToInstance } from "class-transformer";

export default class Courier {
    name: string;
    days: WorkingTime[];
    type: CourierType;
    total: number;

    constructor(name: string, days: WishDay[], type: CourierType) {
        this.name = name;
        this.type = type;
        this.days = plainToInstance(WorkingTime, days.map(day => day.time));
        this.total = this.days.filter(day => !day.isWeekend).reduce((sum, day) => sum + day.duration, 0);
    }
}