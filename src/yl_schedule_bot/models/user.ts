import { Transform } from "class-transformer";
import { CourierType, Role } from "../enums";
import { ObjectId } from "mongodb";
import { ROLES } from "../consts";

export default class User {
    @Transform(({ key, obj }) => obj[key]) _id?: ObjectId;
    userId?: number;
    chatId?: number;
    statsMessageId?: number;
    username!: string;
    name!: string;
    type!: CourierType;
    roles!: Role[];

    get isBike() { return this.type === CourierType.BIKE }
    get isCar() { return this.type === CourierType.CAR }

    private hasRole(role: Role) { return this.roles.includes(role) }
    get isCourier() { return this.hasRole(Role.COURIER) }
    get isAdmin() { return this.hasRole(Role.ADMIN) }
    get isWA() { return this.hasRole(Role.WA) }

    toString() {
        return `@${this.username}, ${this.name}, ${this.roles.map(r => ROLES[r]).join("/")}`;
    }
}