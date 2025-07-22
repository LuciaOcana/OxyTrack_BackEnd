import { Request, Response } from "express";
import { login, userInterface } from "../models/user"
import { userServices } from "../services/userServices";

export async function createUser(req: Request, res: Response): Promise<void> {
    try {
        const { birthDate, ...otherData } = req.body; // Extraemos birthDate y el resto de datos

        // Función para calcular la edad a partir de la fecha de nacimiento
        const calculateAge = (birthDate: string): number => {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            // Si aún no ha pasado el cumpleaños de este año, restamos 1
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        };

        const age = calculateAge(birthDate); // Calculamos la edad

        const userData = { ...otherData, birthDate, age }; // Asegurar que age está en el objeto

        // Crear usuario con la edad calculada
        const user = await userServices.create(userData);
        res.status(201).json(user); // Devuelve el usuario creado
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}

export async function logIn(req: Request, res: Response): Promise<void> {       //No entiendo porque si pongo Promise <Response> me da error
    try {
        const { username, password } = req.body;
        const loggedUser = await userServices.findUserByUsername(username);
        console.log(loggedUser);
      
      if (!loggedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Si todo está bien, simplemente responde con éxito
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
