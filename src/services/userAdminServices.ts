import { getAllDoctors } from "../controllers/userAdminController";
import { userAdminDB } from "../models/userAdmin";
import { userDoctorDB } from "../models/userDoctor";


export const userAdminServices = {
    // Crear un nuevo doctor
    createDoctor: async (entry: {
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
    // Crear un nuevo usuario
    create: async (entry: { username: string; password: string }) => {
        try {
            console.log("Datos recibidos para crear usuario:", entry);

            // Validar que se proporcionen los datos esenciales
            const requiredFields = ['username', 'password'];

            // Crear usuario en la base de datos
            const newUser = await userAdminDB.create(entry);
            return newUser;
        } catch (error) {
            console.error("Error al crear admin:", error);
            throw new Error("Error al crear admin");
        }
    },
    // Buscar Admin por nombre de usuario
    findAdminByUsername: async(username:string) =>{
            return await userAdminDB.findOne({username: username})
        },

    getDoctors: async() =>{
        return await userDoctorDB.find();
        
    }
};
