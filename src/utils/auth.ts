import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta'; // Define en .env

// Generar token con payload
export function generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

// Verificar token y devolver payload o null
export function verifyToken(token: string): any | null {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// Hashear password antes de guardar en la DB
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Comparar password plano con el hash de la DB
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
}
