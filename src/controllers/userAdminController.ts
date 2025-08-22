import { Request, Response } from "express";

import { loginAdmin, userAdminInterface } from "../models/userAdmin"
import { userAdminServices } from "../services/userAdminServices"

import { userServices } from "../services/userServices"


import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"
import { comparePassword, generateToken } from '../utils/auth/auth'; // Ajusta la ruta si es diferente
import { paginatorInterface } from '../utils/paginator';
import { invalidateToken, hashPassword } from '../utils/auth/auth';
import { measurementBatch } from '../controllers/IRController'
import { setLoginStatus } from '../bluetooth/bleListener';


export async function createAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body; // Extraemos birthDate y el resto de datos

    const newAdmin: userAdminInterface = {
      username,
      email,
      password
    };

    // Crear usuario con la edad calculada
    const user = await userAdminServices.create(newAdmin);
    res.status(201).json(user); // Devuelve el usuario creado
  } catch (error) {
    console.error("Error al crear admin:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export async function logInAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    const loggedUser = await userAdminServices.findAdminByUsername(username);

    if (!loggedUser) {
      res.status(404).json({ error: 'Admin no encontrado' });
      return;
    }

    const isMatch = await comparePassword(password, loggedUser.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    const token = generateToken({ id: loggedUser.username }, 'admin');

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}


export async function registerDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, name, lastname, patients = [], password } = req.body;

    if (!username || !email || !password || !name || !lastname) {
      res.status(400).json({ message: "Faltan campos obligatorios" });
      return;
    }

    const newDoctor: userDoctorInterface = {
      username,
      email,
      name,
      lastname,
      patients,
      password
    };
    const createdDoctor = await userAdminServices.createDoctor(newDoctor);

    // 🔄 Actualizamos pacientes para asignarles este doctor
    if (patients.length > 0) {
      for (const patientString of patients) {
          // Extraemos lo que está entre paréntesis
    const match = patientString.match(/\(([^)]+)\)/);
    if (!match) {
      console.warn(`No se encontró username en: ${patientString}`);
      continue;
    }

    const username = match[1]; // lo que está entre paréntesis
        
        const patient = await userAdminServices.findPatientByUsername(username);
        if (patient) {
           const doctorString = `${createdDoctor.name} ${createdDoctor.lastname} (${createdDoctor.username})`;
      await userAdminServices.updatePatientDoctor(patient.username, doctorString);

        } else {
          console.warn(`Paciente no encontrado: ${username}`);
        }
      }
    }

    //const createdDoctor = await userAdminServices.createDoctor(newDoctor);

    res.status(201).json(createdDoctor);
  } catch (error) {
    console.error("Error al registrar doctor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export async function getDoctorsList(req: Request, res: Response): Promise<void> {
  try {
    console.log("Get doctors");
    const page = Number(req.params.page);
    const limit = Number(req.params.limit);
    const paginator = { page, limit } as paginatorInterface
    console.log(paginator);
    const doctors = await userAdminServices.getAllDoctors(paginator.page, paginator.limit);
    if (!doctors) {
      console.error("Doctors is undefined or null");
      res.json([]);
    }
    console.log("doctors", doctors);
    res.json({ doctors });
  } catch (error) {

    console.error(error); //log de errores quitar
    res.status(500).json({ error: 'Failes to get doctors' });
  }
}

export async function editDoctorByAdmin(req: Request, res: Response): Promise<void> {
  try {
    const usernameParam = req.params.username;

    // Buscar el doctor original
    const doctor = await userDoctorServices.findOneDoctor({ username: usernameParam });
    if (!doctor) {
      res.status(404).json({ error: `Doctor with username ${usernameParam} not found` });
      return;
    }

    // Obtener solo los campos enviados en el body
    const updates = req.body as Partial<userDoctorInterface>;

    // Validar username si viene diferente
    if (updates.username && updates.username !== usernameParam) {
      const usernameExists = await userDoctorServices.findOneDoctor({ username: updates.username });
      if (usernameExists) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
    }

    // Construir el objeto actualizado combinando valores viejos y nuevos
    const updatedDoctor: userDoctorInterface = {
      username: updates.username?.trim() || doctor.username,
      email: updates.email?.trim() || doctor.email,
      name: updates.name?.trim() || doctor.name,
      lastname: updates.lastname?.trim() || doctor.lastname,
      patients: Array.isArray(updates.patients) ? updates.patients : doctor.patients,
      password: doctor.password, // temporal, se actualizará si viene nueva
    };

    // Actualizar password si se envía
    if (updates.password && updates.password.trim() !== '') {
      updatedDoctor.password = await hashPassword(updates.password);
    }

    // Guardar cambios en el doctor
    const updated = await userDoctorServices.editDoctorByUsername(usernameParam, updatedDoctor);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update doctor' });
      return;
    }

    // 🔹 Actualizar los pacientes para que tengan asignado este doctor
    for (const patientStr of (updatedDoctor.patients as string[])) {
  const start = patientStr.lastIndexOf('(');
  const end = patientStr.lastIndexOf(')');
  const patientUsername = start !== -1 && end !== -1 && start < end
    ? patientStr.slice(start + 1, end).trim()
    : null;

  if (patientUsername) {
    await userServices.editUserByUsername(patientUsername, {
      doctor: `${updatedDoctor.name} ${updatedDoctor.lastname} (${updatedDoctor.username})`,
    });
  }
}

    res.status(200).json({ message: 'Doctor updated successfully' });

  } catch (error) {
    console.error('Error in editDoctorByAdmin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export async function logOutAdmin(req: Request, res: Response): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(400).json({ message: 'Token no proporcionado' });
      return;
    }

    invalidateToken(token, 'admin'); // ✅ ahora con rol
    setLoginStatus(0);
    
measurementBatch.length = 0;
    res.status(200).json({ message: 'Sesión de admin cerrada correctamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    console.log("Get doctors");
    const usersWNDoctor = await userAdminServices.getUsersWithoutDoctor();
    if (!usersWNDoctor) {
      console.error("Doctors is undefined or null");
      res.json([]);
    }
    console.log("doctors", usersWNDoctor);
    res.json({ usersWNDoctor });
  } catch (error) {

    console.error(error); //log de errores quitar
    res.status(500).json({ error: 'Failes to get doctors' });
  }
}
/*
export async function autoDoctorPAtienteEdit(userDoctorInterface newDoctor): Promise<void>{
  
    // 🔄 Actualizamos pacientes para asignarles este doctor
    if (patients.length > 0) {
      for (const patientString of patients) {
          // Extraemos lo que está entre paréntesis
    const match = patientString.match(/\(([^)]+)\)/);
    if (!match) {
      console.warn(`No se encontró username en: ${patientString}`);
      continue;
    }

    const username = match[1]; // lo que está entre paréntesis
        
        const patient = await userAdminServices.findPatientByUsername(username);
        if (patient) {
          const updated = await userAdminServices.updatePatientDoctor(patient.username, {
            name: newDoctor.name,
            lastname: newDoctor.lastname,
            username: newDoctor.username
          });

        } else {
          console.warn(`Paciente no encontrado: ${username}`);
        }
      }
    }
}
*/

