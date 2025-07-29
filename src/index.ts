import dotenv from 'dotenv';
dotenv.config();


// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import http from 'http'; // ← Añadido
import WebSocket, { WebSocketServer } from 'ws';

import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import userDoctorRoutes from './routes/userDoctorRoutes';
import userAdminRoutes from './routes/userAdminRoutes';
import irRoutes from './routes/irRoutes';
import { startBLEListener } from './bluetooth/bleListener';  // ← Importa el BLE listener

const app = express();

// Conectar a la base de datos MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas
app.get('/', (req: Request, res: Response) => {
    res.json({ message: '# API funcionando correctamente' });
});

app.use('/api/users', userRoutes);
app.use('/api/doctors', userDoctorRoutes);
app.use('/api/admin', userAdminRoutes);
app.use('/api/oxi', irRoutes);

// Iniciar BLE al arrancar el backend
startBLEListener(); // ← Lanza la escucha BLE
// ----------------------------------------------------------------------------------
// 🔌 WebSocket Server
const server = http.createServer(app); // Crear servidor HTTP con Express

const wss = new WebSocketServer({ server }); // Crear WebSocket sobre ese servidor

let connectedClients: WebSocket[] = [];
export const clients = connectedClients;

wss.on('connection', (ws) => {
  console.log('📡 Cliente WebSocket conectado');
  connectedClients.push(ws);

  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado');
    connectedClients = connectedClients.filter(client => client !== ws);
  });
});

// 🌍 Exportar función para emitir SpO₂ a todos los clientes
export function broadcastSpO2(spo2: number) {
  const message = JSON.stringify({ spo2 });

  connectedClients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// ----------------------------------------------------------------------------------
// Iniciar servidor (Express + WebSocket)
const PORT: number = 5000;
server.listen(PORT, () => {
  console.log(`# Servidor Express + WebSocket corriendo en http://localhost:${PORT}`);
});
// Puerto de escucha
//const PORT: number = 5000;
//app.listen(PORT, () => {
//    console.log(`# Servidor corriendo en http://localhost:${PORT}`);
//});
