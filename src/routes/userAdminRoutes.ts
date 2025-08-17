import express from 'express';
import { registerDoctor, createAdmin, logInAdmin, getDoctorsList, editDoctorByAdmin, logOutAdmin, getAllUsers } from '../controllers/userAdminController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Ruta para crear admin
router.post("/createAdmin", createAdmin);

//Ruta per fer el login
router.post("/logInAdmin", logInAdmin);

// Ruta para crear doctor
router.post("/createDoctor", authenticateJWT, registerDoctor);

//Ruta para obtener la información de todos los doctores
router.get("/getDoctors/:page/:limit",authenticateJWT, getDoctorsList); //TokenValidation, AdminValidation, getUsers);

//Falta ruta editDoctor
router.put("/editDoctorAdmin/:username",authenticateJWT, editDoctorByAdmin);

//Ruta para obtener la información de todos los usuarios sin doctor
router.get("/getUsers",authenticateJWT, getAllUsers); //TokenValidation, AdminValidation, getUsers);

// Ruta log out
router.post("/logout",logOutAdmin);

export default router;
