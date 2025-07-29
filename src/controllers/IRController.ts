import { Request, Response } from 'express';
import { saveSpO2ForUser } from '../services/irServices'; // 👈 nuevo import
import { clients } from '../index'; // 👈 importa los clientes WebSocket



// Configuraciones
const BUFFER_MAX_SIZE = 5; // Número máximo de muestras a almacenar (~5 minutos si llega 1 por segundo)
const CALCULATION_INTERVAL_MS = 5 * 60 * 1000; // Calcular SpO₂ cada 60 segundos
const ANALYSIS_WINDOW_SIZE = 5; // Cuántas muestras usar para el cálculo (últimas 100)

// Buffers circulares
const irBuffer: number[] = [];
const redBuffer: number[] = [];

let latestSpO2: number | null = null;

// Variable global para almacenar el usuario activo (viene del token)
export let activeUsername: string | null = null;

//---------------------------------------------------------------------------------
// Utilidad para calcular la media de las medidas

function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

//---------------------------------------------------------------------------------
// Cálculo de SpO2 (relación AC/DC)

function estimateSpO2(ir: number[], red: number[]): number {
  const irAC = Math.max(...ir) - Math.min(...ir);
  const redAC = Math.max(...red) - Math.min(...red);

  const irDC = mean(ir);
  const redDC = mean(red);

  const ratio = (redAC / redDC) / (irAC / irDC);
  const spo2 = 110 - 25 * ratio;

  return Math.min(100, Math.max(0, Math.round(spo2)));
}

//---------------------------------------------------------------------------------
// Procesar cada muestra entrante
// Calcula y devuelve el SpO₂ si hay suficientes datos

function processSample(ir: number, red: number): number | null {
  if (irBuffer.length >= BUFFER_MAX_SIZE) irBuffer.shift();
  if (redBuffer.length >= BUFFER_MAX_SIZE) redBuffer.shift();

  irBuffer.push(ir);
  redBuffer.push(red);

  console.log(`IR: ${ir}, RED: ${red}`);

  if (irBuffer.length >= ANALYSIS_WINDOW_SIZE) {
    const recentIR = irBuffer.slice(-ANALYSIS_WINDOW_SIZE);
    const recentRED = redBuffer.slice(-ANALYSIS_WINDOW_SIZE);
    const spo2 = estimateSpO2(recentIR, recentRED);
    latestSpO2 = spo2;

    if (activeUsername) {
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

    return spo2;
  }

  return null;
}


// ⏱️ Cálculo periódico cada minuto
setInterval(() => {
  if (irBuffer.length >= ANALYSIS_WINDOW_SIZE && redBuffer.length >= ANALYSIS_WINDOW_SIZE) {
    const recentIR = irBuffer.slice(-ANALYSIS_WINDOW_SIZE);
    const recentRED = redBuffer.slice(-ANALYSIS_WINDOW_SIZE);

    const spo2 = estimateSpO2(recentIR, recentRED);
    latestSpO2 = spo2;
    console.log(`🩸 SpO₂ estimado (cada minuto): ${spo2}%`);

    if (activeUsername) {
      // Guardar en archivo y subir
      saveSpO2ForUser(activeUsername, spo2);

      // 🔁 Enviar por WebSocket
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

  } else {
    console.log('⏳ Aún no hay suficientes datos para calcular SpO₂...');
  }
}, CALCULATION_INTERVAL_MS);

//---------------------------------------------------------------------------------
// Endpoint para activar la medición para un usuario (debe llamarse desde frontend autenticado)
export function startMeasurementInternal(username: string) {
  activeUsername = username;
  console.log(`✅ Medición activada automáticamente al iniciar sesión para: ${username}`);
}

//---------------------------------------------------------------------------------
// Endpoint HTTP para recibir muestras (suponiendo que BLE Listener o frontend envía aquí datos)

/*export async function receiveIRRedData(req: Request, res: Response): Promise<void> {
  const raw = req.query.data as string;

  if (!raw || !raw.includes(',')) {
    res.status(400).json({ error: 'Falta el parámetro "data" con valores IR y RED separados por coma' });
    return;
  }

  const [irStr, redStr] = raw.split(',');
  const ir = parseInt(irStr, 10);
  const red = parseInt(redStr, 10);

  if (isNaN(ir) || isNaN(red)) {
    res.status(400).json({ error: 'Valores IR o RED inválidos' });
    return;
  }

  const spo2 = processSample(ir, red);

  res.status(200).json({
    message: 'Valores IR y RED recibidos correctamente',
    ir,
    red,
    ...(spo2 !== null && { spo2 }),
  });
}*/

export function getLatestSpO2(req: Request, res: Response) {
  if (latestSpO2 === null) {
    res.status(404).json({ message: 'No hay datos suficientes para calcular SpO₂ todavía' });
    return;
  }

  res.status(200).json({
    spo2: latestSpO2,
  });
}

export function setActiveUsername(username: string) {
  activeUsername = username;
}

export function getActiveUsername() {
  return activeUsername;
}

//---------------------------------------------------------------------------------
// Exportar por si se usa en otros archivos

export { processSample, latestSpO2 };
