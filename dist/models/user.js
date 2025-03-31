"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDB = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
exports.userSchema = new mongoose_1.Schema({
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
});
exports.userDB = (0, mongoose_1.model)('user', exports.userSchema);
