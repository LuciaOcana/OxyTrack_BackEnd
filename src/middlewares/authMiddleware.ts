import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth/auth";

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado, token faltante o mal formado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: 'Token inválido o expirado' });
    return;
  }

  req.user = decoded;
  next();
}
