import { userDB } from "../models/user";

export const userServices = {
    // Crear un nuevo usuario
    create: async (entry: { username: string; email: string; name: string; lastname: string; birthDate: string; age: string; height: string; weight: string; medication: Array<string>; password: string }) => {
        try {
            console.log("Datos recibidos para crear usuario:", entry);

            // Validar que se proporcionen los datos esenciales
            const requiredFields = ['username', 'email', 'name', 'lastname', 'birthDate', 'height', 'weight', 'password'];

            // Crear usuario en la base de datos
            const newUser = await userDB.create(entry);
            return newUser;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw new Error("Error al crear usuario");
        }
    },
    findUserByUsername: async(username:string) =>{
        return await userDB.findOne({username: username})
    },
    
};
