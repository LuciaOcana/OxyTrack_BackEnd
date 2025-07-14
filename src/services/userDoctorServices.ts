import { userDoctorDB } from "../models/userDoctor";

export const userDoctorServices = {
    // Crear un nuevo doctor
    create: async (entry: {
        username: string;
        email: string;
        name: string;
        lastname: string;
        password: string;
    }) => {
        try {
            console.log("Datos recibidos para crear doctor:", entry);

            const requiredFields = ['username', 'email', 'name', 'lastname', 'password'];

            for (const field of requiredFields) {
                if (!entry[field as keyof typeof entry]) {
                    throw new Error(`Falta el campo requerido: ${field}`);
                }
            }

            const newDoctor = await userDoctorDB.create(entry);
            return newDoctor;
        } catch (error) {
            console.error("Error al crear doctor:", error);
            throw new Error("Error al crear doctor");
        }
    },

    // Buscar doctor por nombre de usuario
    findByUsername: async (username: string) => {
        try {
            const doctor = await userDoctorDB.findOne({ username: username });
            return doctor;
        } catch (error) {
            console.error("Error al buscar doctor por username:", error);
            throw new Error("No se pudo buscar el doctor");
        }
    },
};
