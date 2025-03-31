"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const user_1 = require("../models/user");
exports.userServices = {
    // Crear un nuevo usuario
    create: (entry) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Datos recibidos para crear usuario:", entry);
            // Validar que se proporcionen los datos esenciales
            const requiredFields = ['username', 'email', 'name', 'lastname', 'birthDate', 'height', 'weight', 'password'];
            // Crear usuario en la base de datos
            const newUser = yield user_1.userDB.create(entry);
            return newUser;
        }
        catch (error) {
            console.error("Error al crear usuario:", error);
            throw new Error("Error al crear usuario");
        }
    }),
    findUserByUsername: (username) => __awaiter(void 0, void 0, void 0, function* () {
        return yield user_1.userDB.findOne({ username: username });
    }),
};
