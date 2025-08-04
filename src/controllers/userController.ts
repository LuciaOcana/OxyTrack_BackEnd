import { Request, Response } from "express";
import { userServices } from "../services/userServices";
import { generateToken, comparePassword } from "../utils/auth/auth";
import { startMeasurementInternal } from '../controllers/IRController';
import { setLoginStatus } from '../bluetooth/bleListener';
import { paginatorInterface } from '../utils/paginator';



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
    console.log('age',age);
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

    // Comprobar password
    const isPasswordValid = await comparePassword(password, loggedUser.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    // Generar token con username
    const token = generateToken({ username: loggedUser.username });

    setLoginStatus(1);  //avisa que se ha iniciado sesion y que se puede empezar a medir el valor de IR y RED desde el micro
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

