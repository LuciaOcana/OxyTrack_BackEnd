import { Request, Response } from "express";
import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"
import { comparePassword, generateToken } from '../utils/auth/auth'; // Ajusta la ruta si es diferente
import { userServices } from "../services/userServices";
import { userInterface } from "../models/user"

import { paginatorInterface } from '../utils/paginator';
import { hashPassword } from '../utils/auth/auth';


export async function loginDoctor(req: Request, res: Response): Promise<void> {
    try {
        const { username, password }: login = req.body;
        const loggedUser = await userDoctorServices.findByUsername(username);

        if (!loggedUser) {
            res.status(404).json({ message: "Doctor no encontrado" });
            return;
        }
        const isPasswordValid = await comparePassword(password, loggedUser.password);


       if (!isPasswordValid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }


        // Genera un JWT al iniciar sesión
            const token = generateToken({ id: loggedUser.username});

        res.status(200).json({message: 'Inicio de sesión exitoso',
      token});
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}


export async function getUserList(req: Request, res: Response): Promise<void> {
   try {
    console.log("Get users");
    const page = Number(req.params.page);
    const limit = Number(req.params.limit);
    const paginator = {page, limit} as paginatorInterface
    console.log(paginator);
    const users = await userDoctorServices.getAllUsers(paginator.page, paginator.limit);
    if (!users) {
        console.error("Users is undefined or null");
        res.json([]);
    }
    console.log("users", users);
    res.json({users});
   } catch (error) {

    console.error(error); //log de errores quitar
    res.status(500).json({ error:'Failes to get users'});
   }
}


export async function editUserByDoctor(req: Request, res: Response): Promise<void> {
  try {
    const usernameParam = req.params.username; //lo coge de la URL, en el frontEnd hay que hacer que se le pase por URL

    const user = await userServices.findOne({ username: usernameParam });
    if (!user) {
      res.status(404).json({ error: `User with username ${usernameParam} not found` });
      return;
    }

    const {
    medication,
    } = req.body as Partial<userInterface>;

    // Partimos de los datos actuales
    const updatedUser: userInterface = { ...user };

    // Solo actualizamos medication si llega con datos
    if (Array.isArray(medication) && medication.length > 0) {
      updatedUser.medication = medication;
    }

    const updated = await userServices.editUserByUsername(usernameParam, updatedUser);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }

    res.status(200).json({ message: 'User medication is updated successfully' });

  } catch (error) {
    console.error('Error in editUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export async function updatePasswordDoctor(req: Request, res: Response): Promise<void> {
  try {
    const usernameParam = req.params.username;

    const doctor = await userDoctorServices.findOneDoctor({ username: usernameParam });
    if (!doctor) {
      res.status(404).json({ error: `User with username ${usernameParam} not found` });
      return;
    }

    const {
      password,
    } = req.body as Partial<userInterface>;

    const updatedDoctorPassword: userDoctorInterface = {
      username: doctor.username,
      email: doctor.email,
      name: doctor.name,
      lastname: doctor.lastname,
      password: password && password.trim() !== '' ? password : doctor.password, // será actualizado si se envía uno nuevo
    };

   
    if (password && password.trim() !== '') {
      updatedDoctorPassword.password = await hashPassword(password);
    }

    const updated = await userDoctorServices.editDoctorByUsername(usernameParam, updatedDoctorPassword);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update doctor' });
      return;
    }

    res.status(200).json({ message: 'Doctor password updated successfully' });

  } catch (error) {
    console.error('Error in edit doctor password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

