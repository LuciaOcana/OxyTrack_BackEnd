import express from 'express';
import { loginDoctor } from '../controllers/userDoctorController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 🩺 Ruta para registrar doctor
//router.post("/doctorRegister",authenticateJWT, registerDoctor);

// 🔐 Ruta para login de doctor
router.post("/doctorLogin", loginDoctor);

// Ruta para obtener todos los doctores
//router.get("/getDoctors/:page/:limit",authenticateJWT, getDoctorList); //TokenValidation, AdminValidation, getUsers);

export default router;
