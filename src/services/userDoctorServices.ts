import { userDoctorDB } from "../models/userDoctor";
import { userDB } from "../models/user";


export const userDoctorServices = {

    // Buscar Doctor por nombre de usuario para hacer LogIn
    findByUsername: async (username: string) => {
        try {
            const doctor = await userDoctorDB.findOne({ username: username });
            return doctor;
        } catch (error) {
            console.error("Error al buscar doctor por username:", error);
            throw new Error("No se pudo buscar el doctor");
        }
    },

    // Obtener todos los usuarios
    getAllUsers: async (page: number, limit: number) => {
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

