import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// Roles válidos
type UserRole = 'admin' | 'doctor' | 'user';

// Payload tipado
interface TokenPayload {
  id: string;
  role: UserRole;
  [key: string]: any;
}

// Tokens inválidos organizados por rol
const invalidatedTokens: Record<UserRole, Set<string>> = {
  admin: new Set(),
  doctor: new Set(),
  user: new Set()
};

// 🔐 Generar token con rol incluido
export function generateToken(payload: object, role: UserRole): string {
  return jwt.sign({ ...payload, role }, JWT_SECRET, { expiresIn: '8h' });
}

// ✅ Verificar token con validación de rol y estado
export function verifyToken(token: string, expectedRole?: UserRole): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Validar rol si se espera uno específico
    if (expectedRole && payload.role !== expectedRole) return null;

    // Verificar si el token ha sido invalidado
    if (expectedRole && invalidatedTokens[expectedRole].has(token)) return null;

    return payload;
  } catch {
    return null;
  }
}

// ❌ Invalidar token por rol
export function invalidateToken(token: string, role: UserRole): void {
  invalidatedTokens[role].add(token);
}

// 🔒 Hashear contraseña
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 🔍 Comparar contraseña con hash
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}
