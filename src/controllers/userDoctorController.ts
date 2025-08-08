import { Request, Response } from "express";
import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"
import { comparePassword, generateToken } from '../utils/auth/auth'; // Ajusta la ruta si es diferente
import { userServices } from "../services/userServices";
import { userInterface } from "../models/user"
import { hashPassword } from '../utils/auth/auth';

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


    const updatedUser: userInterface = {
      username: user.username,
      email:user.email,
      name: user.name,
      lastname: user.lastname,
      birthDate: user.birthDate,
      age: user.age, // se mantiene
      height: user.height,
      weight: user.weight,
      medication: medication ?? user.medication, // se mantiene
      password: user.password, // será actualizado si se envía uno nuevo
    };

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
