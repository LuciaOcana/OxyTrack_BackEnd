import express from 'express';
import { registerDoctor, loginDoctor } from '../controllers/userDoctorController';

const router = express.Router();

// 🩺 Ruta para registrar doctor
router.post("/doctorRegister", registerDoctor);

// 🔐 Ruta para login de doctor
router.post("/doctorLogin", loginDoctor);

export default router;
