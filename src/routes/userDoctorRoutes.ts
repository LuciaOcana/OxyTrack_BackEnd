import express from 'express';
import { loginDoctor, getUserList} from '../controllers/userDoctorController';

import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 🔐 Ruta para login de doctor
router.post("/doctorLogin", loginDoctor);

// Ruta para obtener todos los usuarios
router.get("/getUsers/:page/:limit",authenticateJWT, getUserList); //TokenValidation, AdminValidation, getUsers);

//Falta ruta de editUser

export default router;
