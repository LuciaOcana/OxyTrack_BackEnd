import express from 'express';
import { createUser, logIn } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Ruta para crear usuario
router.post("/create", createUser);

//Ruta per fer el login
router.post("/logIn", logIn);

//Falta ruta editUser



export default router;
