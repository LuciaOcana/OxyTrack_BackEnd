import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';


const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta'; // Define en .env

//const tokenMap = new Map<string, { code: string; expiresAt: number }>();

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

/*
// Generar código de 6 dígitos
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Guardar código OTP con expiración
export function saveOTP(email: string, code: string): void {
  const expiresAt = Date.now() + 60 * 1000; // 1 minuto
  tokenMap.set(email, { code, expiresAt });
}

// Verificar OTP
export function verifyOTP(email: string, code: string): boolean {
  const record = tokenMap.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    tokenMap.delete(email);
    return false;
  }
  if (record.code !== code) return false;
  tokenMap.delete(email);
  return true;
}

// Enviar email con nodemailer
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    // configuración SMTP, p.ej. Gmail o servicio externo
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}*/