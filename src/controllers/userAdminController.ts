import { Request, Response } from "express";

import { loginAdmin, userAdminInterface } from "../models/userAdmin"
import { userAdminServices } from "../services/userAdminServices"

import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"

export async function registerDoctor(req: Request, res: Response): Promise<void> {
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

        const createdDoctor = await userAdminServices.createDoctor(newDoctor);
        res.status(201).json(createdDoctor);
    } catch (error) {
        console.error("Error al registrar doctor:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}

export async function createAdmin(req: Request, res: Response): Promise<void> {
    try {
        const { username, password } = req.body; // Extraemos birthDate y el resto de datos

        const newAdmin: userAdminInterface = {
            username,
            password
        };

        // Crear usuario con la edad calculada
        const user = await userAdminServices.create(newAdmin);
        res.status(201).json(user); // Devuelve el usuario creado
    } catch (error) {
        console.error("Error al crear admin:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}

export async function logInAdmin(req: Request, res: Response): Promise<void> {       //No entiendo porque si pongo Promise <Response> me da error
    try {
        const { username, password } = req.body;
        const loggedUser = await userAdminServices.findAdminByUsername(username);
        console.log(loggedUser);
      
      if (!loggedUser) {
      res.status(404).json({ error: 'Admin no encontrado' });
      return;
    }

    // Si todo está bien, simplemente responde con éxito
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
        const doctors = await userAdminServices.getDoctors;
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get doctors' });
    }
}