import { ObjectId } from "mongodb";

export class Role {
    static courier = "courier";
    static admin = "admin";
    static wa = "wa";
    static list: { [key: string]: string } = {
        courier: "курьер",
        admin: "админ",
        wa: "склад"
    }
}

export default class User {
    _id?: ObjectId;
    chatId?: number;
    statsMessageId?: number;
    username: string;
    name: string;
    type: string;
    roles: string[];

    constructor(user: Partial<User>) {
        this._id = user._id;
        this.chatId = user.chatId;
        this.statsMessageId = user.statsMessageId;
        this.username = user.username!;
        this.name = user.name!;
        this.type = user.type!;
        this.roles = user.roles!;
    }

    isBike() { return this.type === "bike" }
    isCar() { return this.type === "car" }

    _hasRole(role: string) { return this.roles.includes(role) }
    isCourier() { return this._hasRole(Role.courier) }
    isAdmin() { return this._hasRole(Role.admin) }
    isWa() { return this._hasRole(Role.wa) }
}