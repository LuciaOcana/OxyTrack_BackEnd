import express from 'express';
import { createUser, logIn } from '../controllers/userController';

const router = express.Router();

// Ruta para crear usuario
router.post("/create", createUser);

//Ruta per fer el login
router.post("/logIn", logIn);

export default router;
