import { getDoctorsList } from "../controllers/userAdminController";
import { userAdminDB } from "../models/userAdmin";
import { userDoctorDB } from "../models/userDoctor";
import { hashPassword } from '../utils/auth/auth'; // Ajusta la ruta si es diferente


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
// Hashear la contraseña
            const hashedPassword = await hashPassword(entry.password);

            // Reemplazar la contraseña original
            const doctorData = {
                ...entry,
                password: hashedPassword
            };
            
            for (const field of requiredFields) {
                if (!entry[field as keyof typeof entry]) {
                    throw new Error(`Falta el campo requerido: ${field}`);
                }
            }

            const newDoctor = await userDoctorDB.create(doctorData);
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
// Hashear la contraseña
            const hashedPassword = await hashPassword(entry.password);

            // Reemplazar la contraseña original
            const adminData = {
                ...entry,
                password: hashedPassword
            };
            // Crear usuario en la base de datos
            const newUser = await userAdminDB.create(adminData);
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
        findAdminByEmail: async (email: string) => {
  try {
    return await userAdminDB.findOne({ email: email });
  } catch (error) {
    console.error("Error al buscar admin por email:", error);
    throw new Error("Error al buscar admin por email");
  }
},


    getAllDoctors: async(page: number , limit: number) =>{
       // Calcular el número de documentos que deben saltarse
               const skip = (page - 1) * limit;
           
               // Realizar la consulta con paginación
               const doctors = await userDoctorDB.find()
                                           .skip(skip)
                                           .limit(limit);
           
               // Retornar los usuarios encontrados
               return doctors;        
    }
};
