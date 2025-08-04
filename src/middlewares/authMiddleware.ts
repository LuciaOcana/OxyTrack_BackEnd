import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth/auth";

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const token = req.header('Token');

  if (!token) {
    res.status(401).json({ message: 'No autorizado, token faltante' });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: 'Token inválido o expirado' });
    return;
  }

  req.user = decoded;
  next();
}
