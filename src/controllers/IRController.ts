// src/controllers/IRController.ts
import { Request, Response } from 'express';
import { sendToPatient } from '../index';
import { insertSpO2ToSheet, insertIRRedToSheet } from '../services/googleSheetsService';
import { notifyDoctorByPatientUsername } from '../controllers/userDoctorController';

export const ANALYSIS_WINDOW_SIZE = 5; // nº de muestras por cálculo

export let measurementBatch: { ir: number; red: number }[] = [];
let latestSpO2: number | null = null;
export let activeUsername: string | null = null;

// Validación de variable de entorno
const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
if (!SHEET_ID) {
  throw new Error('❌ GOOGLE_SHEETS_ID no está definida en el entorno');
}

/** Procesa cada muestra IR/RED recibida desde el ESP32 */
export async function processSample(ir: number, red: number): Promise<void> {
  measurementBatch.push({ ir, red });
  console.log(`📊 Tamaño del batch: ${measurementBatch.length}`);

  console.log(`📥 Muestra recibida: IR=${ir}, RED=${red}`);

  if (activeUsername) {
    try {
      await insertIRRedToSheet(activeUsername, ir, red, SHEET_ID!, 'IR_RED');
    } catch (err) {
      console.error('❌ Error guardando IR/RED en Google Sheets:', err);
    }
  }

  // Cuando ya hay suficientes muestras, calcula
  if (measurementBatch.length >= ANALYSIS_WINDOW_SIZE) {
    await calculateAndDispatch();
  }
}

/** Media de un array numérico */
function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/** Estima SpO₂ a partir de arrays IR y RED */
function estimateSpO2(ir: number[], red: number[]): number | null {
  const irAC = Math.max(...ir) - Math.min(...ir);
  const redAC = Math.max(...red) - Math.min(...red);
  const irDC = mean(ir);
  const redDC = mean(red);

  if (irDC === 0 || redDC === 0 || irAC === 0 || redAC === 0) return null;

  const ratio = (redAC / redDC) / (irAC / irDC);
  const spo2 = 110 - 25 * ratio;
  return Math.min(100, Math.max(0, Math.round(spo2)));
}

/** Calcula SpO₂ con el batch actual y despacha (guardar, notificar, enviar) */
async function calculateAndDispatch(): Promise<void> {
  const irs = measurementBatch.map(m => m.ir);
  const reds = measurementBatch.map(m => m.red);

  // Limpia el batch para el próximo cálculo (ventana por lotes de 5)
  measurementBatch = [];

  const spo2 = estimateSpO2(irs, reds);
//85
  if (spo2 === null || spo2 <= 85) {
    console.warn('⚠️ No se detecta contacto o señal inválida. Verifica el sensor.');
    return;
  }

  latestSpO2 = spo2;
  console.log(`🩸 SpO₂ estimado: ${latestSpO2}%`);

  // Guarda siempre que haya usuario activo
  if (activeUsername) {
    try {
      await insertSpO2ToSheet(activeUsername, latestSpO2, SHEET_ID!, 'SpO2');
    } catch (err) {
      console.error('❌ Error guardando SpO₂ en Google Sheets:', err);
    }
//90
    // Notifica si está bajo
    if (latestSpO2 <= 90) {
      console.warn(`⚠️ SpO₂ bajo (${latestSpO2}%). Notificando al médico…`);
      try {
        
        await notifyDoctorByPatientUsername(activeUsername);
      } catch (err) {
        console.error('❌ Error notificando al médico:', err);
      }
    }

    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // minutos → ms
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // quita la "Z"
    // Envía por WebSocket
    const data = {
      username: activeUsername,
      spo2: latestSpO2,
      timestamp: localISOTime,
    };
    try {
      sendToPatient(activeUsername, data);
    } catch (err) {
      console.error('❌ Error enviando al paciente:', err);
    }
  }
}

/** Inicia la medición para un usuario */
export function startMeasurementInternal(username: string) {
  activeUsername = username;
  console.log(`👤 Usuario activo: ${username} — medición iniciada`);
}

/** Devuelve el último valor de SpO₂ calculado */
export function getLatestSpO2(req: Request, res: Response) {
  if (latestSpO2 === null) {
    res.status(404).json({ message: 'No hay datos suficientes para calcular SpO₂ todavía' });
    return;
  }
  res.status(200).json({ spo2: latestSpO2 });
}

/** Establece el usuario activo */
export function setActiveUsername(username: string) {
  activeUsername = username;
}

/** Devuelve el usuario activo actual */
export function getActiveUsername() {
  return activeUsername;
}
