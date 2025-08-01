import express from 'express';
import { createUser, logIn, getUserList } from '../controllers/userController';

const router = express.Router();

// Ruta para crear usuario
router.post("/create", createUser);

//Ruta per fer el login
router.post("/logIn", logIn);
// Ruta para obtener todos los usuarios
router.get("/getUser/:page/:limit", getUserList); //TokenValidation, AdminValidation, getUsers);

export default router;
