import { Request, Response } from 'express';
//import { saveSpO2ForUser } from '../services/irServices';
import { clients } from '../index';

// Configuraciones
//export const ANALYSIS_WINDOW_SIZE = 5; // 5 muestras (5 minutos)
//export const CALCULATION_INTERVAL_MS = 1 * 60 * 1000; // 5 minutos

export const ANALYSIS_WINDOW_SIZE = 5; // 5 muestras (50 seg)
export const CALCULATION_INTERVAL_MS =  6000;//10 * 1000; // 10 segundos


// Lote de medidas (5 pares IR y RED)
let measurementBatch: { ir: number; red: number }[] = [];

let latestSpO2: number | null = null;
export let activeUsername: string | null = null;

// Recibir cada muestra IR y RED (una por minuto)
function processSample(ir: number, red: number): void {
  measurementBatch.push({ ir, red });
  console.log(`Nueva muestra guardada: IR=${ir}, RED=${red}`);
  // No borres aquí: solo borrarás el batch completo después del cálculo periódico
}

// Utilidad para calcular media
function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Cálculo SpO2 según fórmula AC/DC
function estimateSpO2(ir: number[], red: number[]): number | null {
  const irAC = Math.max(...ir) - Math.min(...ir);
  const redAC = Math.max(...red) - Math.min(...red);
  const irDC = mean(ir);
  const redDC = mean(red);


  if (irDC === 0 || redDC === 0 || irAC === 0 || redAC === 0) {
    return null; // Evita errores por división
  }

  const ratio = (redAC / redDC) / (irAC / irDC);
  const spo2 = 110 - 25 * ratio;
  //return spo2;
  return Math.min(100, Math.max(0, Math.round(spo2)));
}

// Cada 5 minutos calcular SpO2 con las 5 últimas muestras
setInterval(() => {
  let spo2: number|null; // Definimos spo2 aquí, al inicio

  if (measurementBatch.length < ANALYSIS_WINDOW_SIZE) {
    console.log(`⏳ Esperando más muestras... (${measurementBatch.length}/${ANALYSIS_WINDOW_SIZE})`);
    return;
  } else {
    const irs = measurementBatch.map(m => m.ir);
    const reds = measurementBatch.map(m => m.red);
    spo2 = estimateSpO2(irs, reds);
    if (spo2){
      latestSpO2 = Math.min(100, Math.max(0, Math.round(spo2)));
    }
      console.log(`${irs}%: ${reds}%`);

    console.log(`🩸 SpO₂ estimado (cada ${CALCULATION_INTERVAL_MS / 60000} minutos): ${latestSpO2}%`);
  }
  if (spo2 === null) {
  console.log("🚫 No se pudo calcular SpO₂ por datos inválidos.");
  return;
}

  // Ahora spo2 está definido, así que puedes usarlo aquí también:
  if (activeUsername) {
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
