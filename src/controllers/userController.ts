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
        //console.log("La edad es "+ age);

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
      

       /* if (!loggedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, loggedUser.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        if (!loggedUser.admin) {
            return res.status(400).json({ error: 'You are not an Admin' });
        }
        if (loggedUser.disabled==true){
            return res.status(300).json({ error: 'Usuario no habilitado' });
        }

        const token: string = jwt.sign(
            { id: loggedUser.id, username: loggedUser.username, email: loggedUser.email, admin: loggedUser.admin },
            process.env.SECRET || 'token'
        );*/
        

        res.json({ message: 'user logged in', /*token*/ });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
}
