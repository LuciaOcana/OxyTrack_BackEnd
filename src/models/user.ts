import { model, Schema } from "mongoose";
import internal from "stream";

export interface userInterface{
    username: string,
    email: string,
    name: string,
    lastname: string,
    birthDate: string,
    age: string,
    height: string,
    weight: string,
    //lungCapacity: string,
    medication: [],
    password: string
}

export const userSchema = new Schema<userInterface>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    birthDate: {
        type: String,
        required: true,
    },
    age: {
        type: String,
    },
    height: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    medication: [],
    password: {
        type: String,
        required: true,
    }
})

export type login = Pick<userInterface, 'username' | 'password' >

export const userDB = model<userInterface>('user', userSchema)