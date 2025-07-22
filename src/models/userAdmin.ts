import { model, Schema } from "mongoose";
import internal from "stream";

export interface userAdminInterface{
    username: string,
    password: string
}

export const userSchema = new Schema<userAdminInterface>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
})

export type loginAdmin = Pick<userAdminInterface, 'username' | 'password' >

export const userAdminDB = model<userAdminInterface>('userAdmin', userSchema)