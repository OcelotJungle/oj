import { Expose, Transform } from "class-transformer";
import { ObjectId } from "mongodb";
import { Schedule, User } from ".";

export default class Wish {
    @Expose({ toClassOnly: true })
    @Transform(({ value, key, obj }) => obj[key] ?? value)
        _id?: ObjectId;
    courier!: User;
    schedule!: Schedule;

    toString(): string {
        return [this.courier.name, ...this.schedule.days.map(day => day.toString())].join("\n");
    }
}