import express from 'express';
import { loginDoctor, getUserList, editUserByDoctor, updatePasswordDoctor, logOutDoctor } from '../controllers/userDoctorController';

import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 🔐 Ruta para login de doctor
router.post("/doctorLogin", loginDoctor);

// Ruta para obtener todos los usuarios
router.get("/getUsers/:page/:limit",authenticateJWT, getUserList); //TokenValidation, AdminValidation, getUsers);

//Ruta de editUser
router.put("/editUserDoctor",authenticateJWT, editUserByDoctor);

//Falta ruta para que el Doctor pueda cambiar su contraseña y no solo pueda cambiarsela el admin
router.post("/resetPasswordDoctor", updatePasswordDoctor);


// Ruta log out
router.post("/logout",logOutDoctor);

export default router;
