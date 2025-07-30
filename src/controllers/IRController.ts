import { Request, Response } from 'express';
import { saveSpO2ForUser } from '../services/irServices';
import { clients } from '../index';

// Configuraciones
export const ANALYSIS_WINDOW_SIZE = 5; // 5 muestras (5 minutos)
export const CALCULATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

// Lote de medidas (5 pares IR y RED)
let measurementBatch: { ir: number; red: number }[] = [];

let latestSpO2: number | null = null;
export let activeUsername: string | null = null;

// Utilidad para calcular media
function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Cálculo SpO2 según fórmula AC/DC
function estimateSpO2(ir: number[], red: number[]): number {
  const irAC = Math.max(...ir) - Math.min(...ir);
  const redAC = Math.max(...red) - Math.min(...red);
  const irDC = mean(ir);
  const redDC = mean(red);

  const ratio = (redAC / redDC) / (irAC / irDC);
  const spo2 = 110 - 25 * ratio;
  return Math.min(100, Math.max(0, Math.round(spo2)));
}

// Recibir cada muestra IR y RED (una por minuto)
function processSample(ir: number, red: number): void {
  measurementBatch.push({ ir, red });
  console.log(`Nueva muestra guardada: IR=${ir}, RED=${red}`);

  // No borres aquí: solo borrarás el batch completo después del cálculo periódico
}

// Cada 5 minutos calcular SpO2 con las 5 últimas muestras
setInterval(() => {
  if (measurementBatch.length < ANALYSIS_WINDOW_SIZE) {
    console.log(`⏳ Esperando más muestras... (${measurementBatch.length}/${ANALYSIS_WINDOW_SIZE})`);
    return;
  }

  const irs = measurementBatch.map(m => m.ir);
  const reds = measurementBatch.map(m => m.red);
  const spo2 = estimateSpO2(irs, reds);
  latestSpO2 = spo2;

  console.log(`🩸 SpO₂ estimado (cada ${CALCULATION_INTERVAL_MS / 60000} minutos): ${spo2}%`);

  if (activeUsername) {
    saveSpO2ForUser(activeUsername, spo2);

    const data = {
      username: activeUsername,
      spo2,
      timestamp: new Date().toISOString(),
    };

    clients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  // Limpiar lote para acumular siguientes 5 medidas
  measurementBatch = [];
}, CALCULATION_INTERVAL_MS);

// Endpoints y demás funciones:

export function startMeasurementInternal(username: string) {
  activeUsername = username;
  console.log(`✅ Medición activada para: ${username}`);
}

export function getLatestSpO2(req: Request, res: Response) {
  if (latestSpO2 === null) {
    res.status(404).json({ message: 'No hay datos suficientes para calcular SpO₂ todavía' });
    return;
  }
  res.status(200).json({ spo2: latestSpO2 });
}

export function setActiveUsername(username: string) {
  activeUsername = username;
}

export function getActiveUsername() {
  return activeUsername;
}

export { processSample, latestSpO2 };
