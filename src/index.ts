import dotenv from 'dotenv';
dotenv.config();

// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
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

// -----------------------------------------------------------------
// Servidor HTTP (puedes cambiar a HTTPS si habilitas certificados)
const server = http.createServer(app);

// -----------------------------------------------------------------
// 🔌 WebSocket Servers por rol
const doctorWSS = new WebSocketServer({ server, path: "/doctor" });
const patientWSS = new WebSocketServer({ server, path: "/paciente" });

// Diccionarios de conexiones
let connectedDoctors: Record<string, WebSocket> = {};
let connectedPatients: Record<string, WebSocket> = {};

// -----------------------------------------------------------------
// Conexiones de doctores
doctorWSS.on("connection", (ws) => {
  console.log("👨‍⚕️ Doctor conectado");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "init" && data.username) {
        connectedDoctors[data.username] = ws;
        console.log(`✅ Doctor ${data.username} registrado`);
      }
    } catch (err) {
      console.error("❌ Error al procesar mensaje WS Doctor:", err);
    }
  });

  ws.on("close", () => {
    for (const [username, client] of Object.entries(connectedDoctors)) {
      if (client === ws) {
        delete connectedDoctors[username];
        console.log(`🔌 Doctor ${username} desconectado`);
      }
    }
  });
});

// -----------------------------------------------------------------
// Conexiones de pacientes
patientWSS.on("connection", (ws) => {
  console.log("🧑‍🦱 Paciente conectado");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "init" && data.username) {
        connectedPatients[data.username] = ws;
        console.log(`✅ Paciente ${data.username} registrado`);
      }
    } catch (err) {
      console.error("❌ Error al procesar mensaje WS Paciente:", err);
    }
  });

  ws.on("close", () => {
    for (const [username, client] of Object.entries(connectedPatients)) {
      if (client === ws) {
        delete connectedPatients[username];
        console.log(`🔌 Paciente ${username} desconectado`);
      }
    }
  });
});

// -----------------------------------------------------------------
// Función para enviar a un doctor específico
export function sendToDoctor(username: string, payload: any) {
  const doctor = connectedDoctors[username];
  if (doctor && doctor.readyState === WebSocket.OPEN) {
    doctor.send(JSON.stringify(payload));
  } else {
    console.warn(`⚠️ No se pudo enviar notificación, doctor ${username} no conectado`);
  }
}

// Función para enviar a un paciente específico
export function sendToPatient(username: string, payload: any) {
  const patient = connectedPatients[username];
  if (patient && patient.readyState === WebSocket.OPEN) {
    patient.send(JSON.stringify(payload));
  } else {
    console.warn(`⚠️ No se pudo enviar notificación, paciente ${username} no conectado`);
  }
}

// Función para emitir broadcast (a todos)
export function broadcastSpO2(spo2: number) {
  const message = JSON.stringify({ spo2 });

  // A todos los pacientes
  Object.values(connectedPatients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// -----------------------------------------------------------------
// Iniciar servidor (Express + WebSocket)
const PORT: number = 3000;
server.listen(PORT, () => {
  console.log(`# Servidor Express + WebSocket corriendo en http://localhost:${PORT}`);
});
