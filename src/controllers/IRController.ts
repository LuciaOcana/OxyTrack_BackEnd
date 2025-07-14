import { Request, Response } from 'express';

// Configuraciones
const BUFFER_MAX_SIZE = 300; // Número máximo de muestras a almacenar (~5 minutos si llega 1 por segundo)
const CALCULATION_INTERVAL_MS = 60000; // Calcular SpO₂ cada 60 segundos
const ANALYSIS_WINDOW_SIZE = 100; // Cuántas muestras usar para el cálculo (últimas 100)

// Buffers circulares
const irBuffer: number[] = [];
const redBuffer: number[] = [];

let latestSpO2: number | null = null;

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

  // Calcular en tiempo real si hay suficientes muestras
  if (irBuffer.length >= ANALYSIS_WINDOW_SIZE) {
    const recentIR = irBuffer.slice(-ANALYSIS_WINDOW_SIZE);
    const recentRED = redBuffer.slice(-ANALYSIS_WINDOW_SIZE);
    const spo2 = estimateSpO2(recentIR, recentRED);
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
    console.log(`🩸 SpO₂ estimado (cada minuto): ${spo2}%`);
  } else {
    console.log('⏳ Aún no hay suficientes datos para calcular SpO₂...');
  }
}, CALCULATION_INTERVAL_MS);

//---------------------------------------------------------------------------------
// Endpoint HTTP para recibir muestras

export async function receiveIRRedData(req: Request, res: Response): Promise<void> {
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
}


export function getLatestSpO2(req: Request, res: Response) {
  if (latestSpO2 === null) {
    res.status(404).json({ message: 'No hay datos suficientes para calcular SpO₂ todavía' });
    return;
  }

  res.status(200).json({
    spo2: latestSpO2,
  });
}
//---------------------------------------------------------------------------------
// Exportar por si se usa en otros archivos

export { processSample, latestSpO2};
