import express from 'express';
import { registerDoctor, createAdmin, logInAdmin, getAllDoctors } from '../controllers/userAdminController';

const router = express.Router();

// Ruta para crear doctor
router.post("/createDoctor", registerDoctor);

// Ruta para crear admin
router.post("/createAdmin", createAdmin);

//Ruta per fer el login
router.post("/logInAdmin", logInAdmin);

//Ruta para obtener la información de todos los doctores
router.get("/getDoctors", getAllDoctors);

export default router;
