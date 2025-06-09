import { Request, Response } from 'express';


export async function receiveIRData(req: Request, res: Response): Promise<void> {
  const ir = req.params.ir;

  if (!ir) {
    res.status(400).json({ error: 'Falta el valor IR en los parámetros de la URL' });
    return;
  }

  console.log(`💡 Valor IR recibido: ${ir}`);

  // Aquí podrías guardar en una base de datos, emitir vía WebSocket, etc.

  res.status(200).json({
    message: 'Valor IR recibido correctamente',
    ir: parseInt(ir, 10), // si esperas que sea un número
  });
}
  

