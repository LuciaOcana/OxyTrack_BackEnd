import express from 'express';
import { createUser, logIn,verifyUserPassword, editUser, resetPassword, getUser, logOut } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// Ruta para crear usuario
router.post("/create", createUser);

//Ruta per fer el login
router.post("/logIn", logIn);

//Ruta per fer el edit de un user
router.post("/verificarPassword/:username", verifyUserPassword);

//Ruta per fer el edit de un user
router.put("/editUser/:username",authenticateJWT, editUser);

router.post("/resetPassword",authenticateJWT, resetPassword);

router.get("/getUser/:username",authenticateJWT, getUser)

// Ruta log out
router.post("/logout",logOut);


export default router;
