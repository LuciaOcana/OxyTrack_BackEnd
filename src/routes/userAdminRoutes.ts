import express from 'express';
import { registerDoctor, createAdmin, logInAdmin, getDoctorsList } from '../controllers/userAdminController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Ruta para crear doctor
router.post("/createDoctor", authenticateJWT, registerDoctor);

// Ruta para crear admin
router.post("/createAdmin", createAdmin);

//Ruta per fer el login
router.post("/logInAdmin", logInAdmin);

//Ruta para obtener la información de todos los doctores
router.get("/getDoctors/:page/:limit",authenticateJWT, getDoctorsList); //TokenValidation, AdminValidation, getUsers);

export default router;
