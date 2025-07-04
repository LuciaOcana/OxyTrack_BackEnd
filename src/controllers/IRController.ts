import { Request, Response } from 'express';

const IR_BUFFER_SIZE = 10;
const irBuffer: number[] = [];

// Algoritmo muy básico para estimar HR a partir de picos en IR
function estimateHeartRate(irSamples: number[]): number {
  const peaks: number[] = [];

  for (let i = 1; i < irSamples.length - 1; i++) {
    if (irSamples[i] > irSamples[i - 1] && irSamples[i] > irSamples[i + 1]) {
      peaks.push(i);
    }
  }

  if (peaks.length < 2) return 0;

  // Tiempo promedio entre picos en muestras
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Suponiendo 100 muestras por segundo
  const sampleRateHz = 100;
  const heartRate = (60 * sampleRateHz) / avgInterval;

  return Math.round(heartRate);
}

function processIRSample(ir: number): void {
  if (irBuffer.length >= IR_BUFFER_SIZE) irBuffer.shift();
  irBuffer.push(ir);

  console.log(`💡 Nuevo valor IR: ${ir}`);

  if (irBuffer.length === IR_BUFFER_SIZE) {
    const heartRate = estimateHeartRate(irBuffer);
    console.log(`📈 Estimación de frecuencia cardíaca: ${heartRate} BPM`);
  }
}

// Endpoint opcional si usas Express para enviar datos por URL (e.g. `/ir?ir=12345`)
export async function receiveIRData(req: Request, res: Response): Promise<void> {
  const irStr = req.query.ir as string;

  if (!irStr) {
    res.status(400).json({ error: 'Falta el valor IR en la consulta' });
    return;
  }

  const ir = parseInt(irStr, 10);

  if (isNaN(ir)) {
    res.status(400).json({ error: 'Valor IR inválido' });
    return;
  }

  processIRSample(ir);

  res.status(200).json({
    message: 'Valor IR recibido correctamente',
    ir,
  });
}

// También exportamos la función para que pueda ser usada desde bleListener
export { processIRSample };
