// src/controllers/IRController.ts
import { Request, Response } from 'express';
import { clients } from '../index';
import { insertSpO2ToSheet, insertIRRedToSheet } from '../services/googleSheetsService';

export const ANALYSIS_WINDOW_SIZE = 5; // Nº de muestras necesarias para calcular SpO₂
export const CALCULATION_INTERVAL_MS = 120000; // Intervalo de cálculo (2 minutos)

let measurementBatch: { ir: number; red: number }[] = [];
let latestSpO2: number | null = null;
export let activeUsername: string | null = null;

// Validación de variable de entorno
const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
if (!SHEET_ID) {
  throw new Error('❌ GOOGLE_SHEETS_ID no está definida en el entorno');
}

/**
 * Procesa cada muestra IR/RED recibida desde el ESP32
 */
export async function processSample(ir: number, red: number): Promise<void> {
  measurementBatch.push({ ir, red });
  console.log(`📥 Muestra recibida: IR=${ir}, RED=${red}`);

  if (activeUsername) {
    try {
      await insertIRRedToSheet(activeUsername, ir, red, SHEET_ID!, 'IR_RED');
    } catch (err) {
      console.error('❌ Error guardando IR/RED en Google Sheets:', err);
    }
  }
}

/**
 * Calcula la media de un array numérico
 */
function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Estima el valor de SpO₂ a partir de arrays IR y RED
 */
function estimateSpO2(ir: number[], red: number[]): number | null {
  const irAC = Math.max(...ir) - Math.min(...ir);
  const redAC = Math.max(...red) - Math.min(...red);
  const irDC = mean(ir);
  const redDC = mean(red);

  if (irDC === 0 || redDC === 0 || irAC === 0 || redAC === 0) {
    return null;
  }

  const ratio = (redAC / redDC) / (irAC / irDC);
  const spo2 = 110 - 25 * ratio;
  return Math.min(100, Math.max(0, Math.round(spo2)));
}

/**
 * Intervalo periódico para calcular SpO₂ y enviarlo a Google Sheets + WebSocket
 */
setInterval(async () => {
  if (measurementBatch.length < ANALYSIS_WINDOW_SIZE) {
    console.log(`⏳ Esperando más muestras... (${measurementBatch.length}/${ANALYSIS_WINDOW_SIZE})`);
    return;
  }

  const irs = measurementBatch.map(m => m.ir);
  const reds = measurementBatch.map(m => m.red);
  const spo2 = estimateSpO2(irs, reds);

  if (spo2 === null) {
    console.log('🚫 No se pudo calcular SpO₂ por datos inválidos.');
    measurementBatch = [];
    return;
  }

  latestSpO2 = spo2;
  console.log(`🩸 SpO₂ estimado: ${latestSpO2}%`);

  if (activeUsername) {
    try {
      await insertSpO2ToSheet(activeUsername, latestSpO2, SHEET_ID, 'SpO2');
    } catch (err) {
      console.error('❌ Error guardando SpO₂ en Google Sheets:', err);
    }
  }

  const data = {
    username: activeUsername,
    spo2: latestSpO2,
    timestamp: new Date().toISOString(),
  };

  clients.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });

  measurementBatch = [];
}, CALCULATION_INTERVAL_MS);

/**
 * Inicia la medición para un usuario
 */
export function startMeasurementInternal(username: string) {
  activeUsername = username;
  console.log(`👤 Usuario activo: ${username} — medición iniciada`);
}

/**
 * Devuelve el último valor de SpO₂ calculado
 */
export function getLatestSpO2(req: Request, res: Response) {
  if (latestSpO2 === null) {
    res.status(404).json({ message: 'No hay datos suficientes para calcular SpO₂ todavía' });
    return;
  }
  res.status(200).json({ spo2: latestSpO2 });
}

/**
 * Establece el usuario activo
 */
export function setActiveUsername(username: string) {
  activeUsername = username;
}

/**
 * Devuelve el usuario activo actual
 */
export function getActiveUsername() {
  return activeUsername;
}
