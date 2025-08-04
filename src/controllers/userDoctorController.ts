import { Request, Response } from "express";
import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"
import { comparePassword, generateToken } from '../utils/auth/auth'; // Ajusta la ruta si es diferente

import { paginatorInterface } from '../utils/paginator';


/*export async function registerDoctor(req: Request, res: Response): Promise<void> {
    try {
        const { username, email, name, lastname, password } = req.body;

        if (!username || !email || !password || !name || !lastname) {
            res.status(400).json({ message: "Faltan campos obligatorios" });
            return;
        }

        const newDoctor: userDoctorInterface = {
            username,
            email,
            name,
            lastname,
            password
        };

        const createdDoctor = await userDoctorServices.create(newDoctor);
        res.status(201).json(createdDoctor);
    } catch (error) {
        console.error("Error al registrar doctor:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}*/

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
/*export async function getDoctorList(req: Request, res: Response): Promise<void> {
   try {
    console.log("Get doctors");
    const page = Number(req.params.page);
    const limit = Number(req.params.limit);
    const paginator = {page, limit} as paginatorInterface
    console.log(paginator);
    const doctors = await userDoctorServices.getAllDoctors(paginator.page, paginator.limit);
    if (!doctors) {
        console.error("Doctors is undefined or null");
        res.json([]);
    }
    console.log("Doctors", doctors);
    res.json({doctors});
   } catch (error) {

    console.error(error); //log de errores quitar
    res.status(500).json({ error:'Failes to get doctors'});
   }
}*/
