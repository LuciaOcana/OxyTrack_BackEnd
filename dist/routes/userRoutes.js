"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// Ruta para crear usuario
router.post("/create", userController_1.createUser);
//Ruta per fer el login
router.post("/logIn", userController_1.logIn);
exports.default = router;
