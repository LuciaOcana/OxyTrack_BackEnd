import { model, Schema } from "mongoose";
import internal from "stream";

export interface userDoctorInterface{
    username: string,
    email: string,
    name: string,
    lastname: string,
    password: string
}

export const userDoctorSchema = new Schema<userDoctorInterface>({
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
    password: {
        type: String,
        required: true,
    }
})

export type login = Pick<userDoctorInterface, 'username' | 'password' >

export const userDoctorDB = model<userDoctorInterface>('userDoctor', userDoctorSchema)