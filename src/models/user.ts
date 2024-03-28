import { ObjectId } from "mongodb";

export default interface User {
    name: string,
    hash: string,
    salt: string,
    _id: ObjectId,
}