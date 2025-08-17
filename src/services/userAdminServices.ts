import { getDoctorsList } from "../controllers/userAdminController";
import { userDB } from "../models/user";
import { userAdminDB } from "../models/userAdmin";
import { userDoctorDB } from "../models/userDoctor";
import { hashPassword } from '../utils/auth/auth'; // Ajusta la ruta si es diferente


export const userAdminServices = {

    // Crear un nuevo usuario
    create: async (entry: { username: string; password: string }) => {
        try {
            console.log("Datos recibidos para crear administrador:", entry);

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
            const newAdmin = await userAdminDB.create(adminData);
            return newAdmin;
        } catch (error) {
            console.error("Error al crear admin:", error);
            throw new Error("Error al crear admin");
        }
    },

    // Buscar Admin por nombre de usuario para hacer LogIn
    findAdminByUsername: async (username: string) => {
        return await userAdminDB.findOne({ username: username })
    },

    // Crear un nuevo doctor
    createDoctor: async (entry: {
        username: string;
        email: string;
        name: string;
        lastname: string;
        patients:[];
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

            const newDoctor = await userDoctorDB.create(doctorData);
            return newDoctor;
        } catch (error) {
            console.error("Error al crear doctor:", error);
            throw new Error("Error al crear doctor");
        }
    },

    getAllDoctors: async (page: number, limit: number) => {
        // Calcular el número de documentos que deben saltarse
        const skip = (page - 1) * limit;

        // Realizar la consulta con paginación
        const doctors = await userDoctorDB.find()
            .skip(skip)
            .limit(limit);

        // Retornar los usuarios encontrados
        return doctors;
    },
    getUsersWithoutDoctor: async () => {
  try {
    const patients = await userDB.find(
      { doctor: { $in: [null, ""] } }, 
      'username name lastname' // 👈 ahora también devuelve username
    );

    // Devuelve objetos en vez de solo strings
    return patients.map(p => ({
      username: p.username,
      name: p.name,
      lastname: p.lastname
    }));
  } catch (error) {
    console.error("Error al obtener pacientes sin doctor:", error);
    throw new Error("Error al obtener pacientes sin doctor");
  }
},

  findPatientByUsername: async (username: string) => {
  try {
    const patient = await userDB.findOne({ username });
    return patient; // devuelve null si no existe
  } catch (error) {
    console.error("Error buscando paciente:", error);
    throw error;
  }
},
// Actualiza el doctor de un paciente
updatePatientDoctor: async (username: string, doctorData: String) => {
  try {
        console.error("Datos del doctor:", doctorData);

    const updatedPatient = await userDB.findOneAndUpdate(
      { username },
      { doctor: doctorData }, // aquí se actualiza el campo doctor
      { new: true } // devuelve el paciente actualizado
    );
    return updatedPatient; // null si no existe
  } catch (error) {
    console.error("Error actualizando paciente:", error);
    throw error;
  }
}
};
