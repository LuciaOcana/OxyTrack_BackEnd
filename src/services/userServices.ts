import { userDB } from "../models/user";
import { hashPassword } from '../utils/auth'; // Ajusta la ruta si es diferente


export const userServices = {
    // Crear un nuevo usuario
    create: async (entry: { username: string; email: string; name: string; lastname: string; birthDate: string; age: string; height: string; weight: string; medication: Array<string>; password: string }) => {
        try {
            console.log("Datos recibidos para crear usuario:", entry);

            // Validar que se proporcionen los datos esenciales
            const requiredFields = ['username', 'email', 'name', 'lastname', 'birthDate', 'height', 'weight', 'password'];

            // Hashear la contraseña
            const hashedPassword = await hashPassword(entry.password);

            // Reemplazar la contraseña original
            const userData = {
                ...entry,
                password: hashedPassword
            };
            // Crear usuario en la base de datos
            const newUser = await userDB.create(userData);
            return newUser;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw new Error("Error al crear usuario");
        }
    },
    findUserByUsername: async (username: string) => {
        return await userDB.findOne({ username: username })
    },
     // Obtener todos los usuarios
    getAllUsers: async (page: number , limit: number ) => {
        // Calcular el número de documentos que deben saltarse
        const skip = (page - 1) * limit;
    
        // Realizar la consulta con paginación
        const users = await userDB.find()
                                    .skip(skip)
                                    .limit(limit);
    
        // Retornar los usuarios encontrados
        return users;
    },

};
