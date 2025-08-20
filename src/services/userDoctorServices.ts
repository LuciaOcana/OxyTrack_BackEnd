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
    // Buscar User por nombre de usuario para hacer LogIn
    findDoctorUserByUsername: async (username: string) => {
        return await userDoctorDB.findOne({ username: username })
    },

    // Actualizar un usuario por username
    editDoctorByUsername: async (username: string, body: object) => {
        console.log(body);
        
        return await userDoctorDB.findOneAndReplace({ username }, body, { new: true });
    },
    // Buscar un usuario por cualquier filtro (ej: { username }, { email }, etc)
  findOneDoctor: async (filter: object) => {
    try {
      const doctor = await userDoctorDB.findOne(filter);
      return doctor;
    } catch (error) {
      console.error('Error en userServices.findOne:', error);
      throw error;
    }
  },

    updatePassword: async(username: string, newPassword: string) => {
  try {
    const result = await userDoctorDB.updateOne(
      { username },
      { $set: { password: newPassword } }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating password:", error);
    return false;
  }
},
  
};

