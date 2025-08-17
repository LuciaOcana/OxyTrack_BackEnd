import { Request, Response } from "express";

import { loginAdmin, userAdminInterface } from "../models/userAdmin"
import { userAdminServices } from "../services/userAdminServices"

import { userServices } from "../services/userServices"


import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"
import { comparePassword, generateToken } from '../utils/auth/auth'; // Ajusta la ruta si es diferente
import { paginatorInterface } from '../utils/paginator';
import { invalidateToken, hashPassword } from '../utils/auth/auth';


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

export async function logInAdmin(req: Request, res: Response): Promise<void> {       //No entiendo porque si pongo Promise <Response> me da error
  try {
    const { username, password } = req.body;
    const loggedUser = await userAdminServices.findAdminByUsername(username);
    console.log(loggedUser);

    if (!loggedUser) {
      res.status(404).json({ error: 'Admin no encontrado' });
      return;
    }
    const isMatch = await comparePassword(password, loggedUser.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }
    // Genera un JWT al iniciar sesión
    const token = generateToken({ id: loggedUser.username });//, role: 'admin' });

    // Si todo está bien, simplemente responde con éxito
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

    const doctor = await userDoctorServices.findOneDoctor({ username: usernameParam });
    if (!doctor) {
      res.status(404).json({ error: `User with username ${usernameParam} not found` });
      return;
    }

    const {
      username,
      email,
      name,
      lastname,
      patients,
      password,
    } = req.body as Partial<userDoctorInterface>;

    if (username && username !== usernameParam) {
      const usernameExists = await userDoctorServices.findOneDoctor({ username });
      if (usernameExists) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
    }

    const updatedDoctor: userDoctorInterface = {
      username: username && username.trim() !== '' ? username : doctor.username,
      email: email && email.trim() !== '' ? email : doctor.email,
      name: name && name.trim() !== '' ? name : doctor.name,
      patients: [],
      lastname: lastname && lastname.trim() !== '' ? lastname : doctor.lastname,

      password: password && password.trim() !== '' ? password : doctor.password,
    };

    if (password && password.trim() !== '') {
      updatedDoctor.password = await hashPassword(password);
    }


    const updated = await userDoctorServices.editDoctorByUsername(usernameParam, updatedDoctor);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update doctor' });
      return;
    }

    res.status(200).json({ message: 'Doctor updated successfully' });

  } catch (error) {
    console.error('Error in edit doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
export async function logOutAdmin(req: Request, res: Response): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // token Bearer
    if (!token) {
      res.status(400).json({ message: 'Token no proporcionado' });
      return;
    }

    invalidateToken(token); // invalida el token actual

    res.status(200).json({ message: 'Sesión de user cerrada correctamente' });
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

