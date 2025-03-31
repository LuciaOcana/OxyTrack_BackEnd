"use strict";
// ------------------------------------------------------------
// Gestión de la conexión de la BBDD en aplicaciones de Node.js
// ------------------------------------------------------------
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Definición de la URI de conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/OxyTrack'; // Modifica esto según sea necesario
// Función para conectar a la Base de Datos de MongoDB sin .env
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Conexión a la base de datos
        yield mongoose_1.default.connect(mongoURI);
        console.log('# API conectada a MongoDB');
    }
    catch (error) {
        console.error('# Error al conectar a MongoDB:', error);
        process.exit(1); // Termina el proceso si hay un error en la conexión
    }
});
// Exportar la función de conexión
exports.default = connectDB;
