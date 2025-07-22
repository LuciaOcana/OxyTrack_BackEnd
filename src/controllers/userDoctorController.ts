import { Request, Response } from "express";
import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"

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

        const doctor = await userDoctorServices.findByUsername(username);

        if (!doctor) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        if (doctor.password !== password) {
            res.status(401).json({ message: "Contraseña incorrecta" });
            return;
        }

        res.status(200).json({ message: "Login exitoso", doctor });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}
