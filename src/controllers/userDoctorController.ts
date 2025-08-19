import { Request, Response } from "express";
import { sendToDoctor } from "../index"; // Ajusta ruta

import { login, userDoctorInterface } from "../models/userDoctor"
import { userDoctorServices } from "../services/userDoctorServices"
import { comparePassword, generateToken } from '../utils/auth/auth'; // Ajusta la ruta si es diferente
import { userServices } from "../services/userServices";
import { userInterface } from "../models/user"

import { paginatorInterface } from '../utils/paginator';
import { invalidateToken, hashPassword } from '../utils/auth/auth';


export async function loginDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { username, password }: login = req.body;
    const loggedUser = await userDoctorServices.findByUsername(username);

    if (!loggedUser) {
      res.status(404).json({ message: "Doctor no encontrado" });
      return;
    }
    const isPasswordValid = await comparePassword(password, loggedUser.password);


    if (!isPasswordValid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }


    // Genera un JWT al iniciar sesión
    const token = generateToken({ id: loggedUser.username });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}


export async function getUserList(req: Request, res: Response): Promise<void> {
  try {
    console.log("Get users");
    const page = Number(req.params.page);
    const limit = Number(req.params.limit);
    const paginator = { page, limit } as paginatorInterface
    console.log(paginator);
    const users = await userDoctorServices.getAllUsers(paginator.page, paginator.limit);
    if (!users) {
      console.error("Users is undefined or null");
      res.json([]);
    }
    console.log("users", users);
    res.json({ users });
  } catch (error) {

    console.error(error); //log de errores quitar
    res.status(500).json({ error: 'Failes to get users' });
  }
}


export async function editUserByDoctor(req: Request, res: Response): Promise<void> {
  try {
    const usernameParam = req.params.username;

    const user = await userServices.findOne({ username: usernameParam });
    if (!user) {
      res.status(404).json({ error: `User with username ${usernameParam} not found` });
      return;
    }

    const { medication } = req.body as Partial<userInterface>;

    // 🔹 Construir objeto con solo los campos que quieras actualizar
    const updatedFields: Partial<userInterface> = {};
    if (Array.isArray(medication) && medication.length > 0) {
      updatedFields.medication = medication;
    }

    const updated = await userServices.editUserByUsername(usernameParam, updatedFields);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }

    res.status(200).json({ message: 'User medication is updated successfully' });

  } catch (error) {
    console.error('Error in editUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



export async function updatePasswordDoctor(req: Request, res: Response): Promise<void> {
  try {
        console.log("Entroooo");

   // const usernameParam = req.params.username;
    const { username, password } = req.body as Partial<userInterface>;

    const doctor = await userDoctorServices.findOneDoctor({ username: username });
    console.log(doctor);
    if (!doctor) {
      res.status(404).json({ error: `User with username ${username} not found` });
      return;
    }
    console.log("imprime ", req);
   // const { password } = req.body as Partial<userInterface>;

    const updatedDoctorPassword: Partial<userDoctorInterface> = { };
    if (password && password.trim() !== '') {
      updatedDoctorPassword.password = await hashPassword(password);
    }
  const usernamee: string | undefined = updatedDoctorPassword.username?.toString();

    const updated = await userDoctorServices.editDoctorByUsername(usernamee!, updatedDoctorPassword);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update doctor' });
      return;
    }

    res.status(200).json({ message: 'Doctor password updated successfully' });

  } catch (error) {
    console.error('Error in edit doctor password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function notifyDoctorByPatientUsername(username: string): Promise<void> {
  try {
    // Buscar el doctor asignado al paciente
    const doctor = await userDoctorServices.findOneDoctor({ patients: username });

    if (!doctor) {
      console.warn(`⚠️ No se encontró un doctor para el paciente ${username}`);
      return;
    }

    const payload = {
      type: "patientAlert",
      target: doctor.username, // Para que el frontend sepa a quién va
      patient: username,
      message: `⚠️ Alerta automática: el paciente ${username} tiene un nivel de SpO₂ bajo.`
    };

    // Enviar al doctor vía WebSocket
    sendToDoctor(doctor.username, payload);

    console.log(`📡 Notificación enviada a doctor ${doctor.username}`);
  } catch (error) {
    console.error("❌ Error en notifyDoctorByPatientUsername:", error);
  }
}

// Opcional: integración con email/SMS en paralelo
export async function sendNotification(to: string, message: string): Promise<void> {
  console.log(`📨 Sending external notification to ${to}: ${message}`);
  // Aquí podrías integrar con SendGrid, Firebase, Twilio, etc.
}

export async function logOutDoctor(req: Request, res: Response): Promise<void> {
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
