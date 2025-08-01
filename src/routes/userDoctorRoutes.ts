import express from 'express';
import { registerDoctor, loginDoctor, getDoctorList } from '../controllers/userDoctorController';

const router = express.Router();

// 🩺 Ruta para registrar doctor
router.post("/doctorRegister", registerDoctor);

// 🔐 Ruta para login de doctor
router.post("/doctorLogin", loginDoctor);

// Ruta para obtener todos los doctores
router.get("/getDoctors/:page/:limit", getDoctorList); //TokenValidation, AdminValidation, getUsers);

export default router;
