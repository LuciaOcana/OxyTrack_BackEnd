import { Request, Response } from "express";
import { userServices } from "../services/userServices";
import { generateToken, comparePassword } from "../utils/auth/auth";
import { startMeasurementInternal } from '../controllers/IRController';
import { setLoginStatus } from '../wifi/wifiListener';
import { paginatorInterface } from '../utils/paginator';
import { login, userInterface } from "../models/user"
import { invalidateToken, hashPassword } from '../utils/auth/auth';
import { measurementBatch } from '../controllers/IRController'


export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { birthDate, password, ...otherData } = req.body;

    // Calcular edad (tu función)
    const calculateAge = (birthDate: string): number => {
      // Esperamos formato: dd/mm/yyyy
      const [day, month, year] = birthDate.split('/').map(Number);

      // Validación básica por si la fecha es incorrecta
      if (!day || !month || !year) return NaN;

      const birth = new Date(year, month - 1, day); // JS usa meses 0-indexados
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };
    const age = calculateAge(birthDate).toString();
    console.log('age', age);
    const userData = { ...otherData, birthDate, age, password }; // password sin hashear aquí


    const user = await userServices.create(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export async function logIn(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    const loggedUser = await userServices.findUserByUsername(username);

    if (!loggedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const isPasswordValid = await comparePassword(password, loggedUser.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    const token = generateToken({ id: loggedUser.username }, 'user'); // ✅ rol explícito

    setLoginStatus(1);
    startMeasurementInternal(username);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      username: loggedUser.username,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}


export async function verifyUserPassword(req: Request, res: Response): Promise<void> {
  try {
    const username = req.params.username;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      res.status(400).json({ error: 'Current password is required' });
      return;
    }

    const user = await userServices.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    res.status(200).json({ message: 'Password verified' });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
export async function editUser(req: Request, res: Response): Promise<void> {
  try {
    const usernameParam = req.params.username;

    const user = await userServices.findOne({ username: usernameParam });
    if (!user) {
      res.status(404).json({ error: `User with username ${usernameParam} not found` });
      return;
    }

    const {
      username,
      email,
      name,
      lastname,
      birthDate,
      height,
      weight,
      password,
    } = req.body as Partial<userInterface>;

    // Calcular edad (tu función)
    const calculateAge = (birthDate: string): number => {
      // Esperamos formato: dd/mm/yyyy
      const [day, month, year] = birthDate.split('/').map(Number);

      // Validación básica
      if (!day || !month || !year) return NaN;

      const birth = new Date(year, month - 1, day); // meses 0-indexados
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };
    if (username && username !== usernameParam) {
      const usernameExists = await userServices.findOne({ username });
      if (usernameExists) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
    }

    const updatedUser: userInterface = {
      username: username && username.trim() !== '' ? username : user.username,
      email: email && email.trim() !== '' ? email : user.email,
      name: name && name.trim() !== '' ? name : user.name,
      lastname: lastname && lastname.trim() !== '' ? lastname : user.lastname,
      birthDate: birthDate && birthDate.trim() !== '' ? birthDate : user.birthDate,
      age: birthDate && birthDate.trim() !== ''
        ? calculateAge(birthDate).toString()   // 🔹 recalcula si hay nueva fecha
        : user.age,                            // 🔹 mantiene si no se cambia
      height: height && height.trim() !== '' ? height : user.height,
      weight: weight && weight.trim() !== '' ? weight : user.weight,
      medication: user.medication, // se mantiene
      doctor: user.doctor,
      password: user.password, // será actualizado si se envía uno nuevo
    };



    if (password && password.trim() !== '') {
      updatedUser.password = await hashPassword(password);
    }

    const updated = await userServices.editUserByUsername(usernameParam, updatedUser);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }

    res.status(200).json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Error in editUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
export async function logOut(req: Request, res: Response): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(400).json({ message: 'Token no proporcionado' });
      return;
    }

    invalidateToken(token, 'user'); // ✅ ahora con rol
        setLoginStatus(0);

measurementBatch.length = 0;

    res.status(200).json({ message: 'Sesión de usuario cerrada correctamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}


export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      res.status(400).json({ error: "Username and new password are required" });
      return;
    }

    const user = await userServices.findOne({ username });
    if (!user) {
      res.status(404).json({ error: `User with username ${username} not found` });
      return;
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar solo el password
    const updated = await userServices.updatePassword(username, hashedPassword);

    if (!updated) {
      res.status(500).json({ error: "Failed to reset password" });
      return;
    } 

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.params;

    const user = await userServices.getUserByUsername(username);

    if (!user) {
      res.status(404).json({ message: `User with username ${username} not found` });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

