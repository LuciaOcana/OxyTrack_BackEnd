import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import userDoctorRoutes from './routes/userDoctorRoutes';
import userAdminRoutes from './routes/userAdminRoutes';
import irRoutes from './routes/irRoutes';
import { startBLEListener } from './bluetooth/bleListener';
import Notification from "./models/notification";

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas REST
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '# API funcionando correctamente' });
});
app.use('/api/users', userRoutes);
app.use('/api/doctors', userDoctorRoutes);
app.use('/api/admin', userAdminRoutes);
app.use('/api/oxi', irRoutes);

// Iniciar BLE
startBLEListener();

// -----------------------------------------------------------------
// Servidor HTTP
const server = http.createServer(app);

// -----------------------------------------------------------------
// WebSocket Server sin path
const wss = new WebSocketServer({ server });

// Diccionarios de conexiones
let connectedDoctors: Record<string, WebSocket> = {};
let connectedPatients: Record<string, WebSocket> = {};

// -----------------------------------------------------------------
// Conexión WebSocket general
wss.on("connection", (ws, req) => {
  console.log("🔌 Nueva conexión WebSocket desde:", req.socket.remoteAddress);

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log("📩 Mensaje recibido:", data);

      if (data.type === "init" && data.username && data.role) {
        const key = data.username.toLowerCase().trim();

        if (data.role === "doctor") {
          connectedDoctors[key] = ws;
          console.log(`✅ Doctor ${key} conectado`);

          // Buscar notificaciones no leídas en DB
  const pending = await Notification.find({ doctor: key, read: false });
  pending.forEach((n) => {
    ws.send(JSON.stringify(n));
  });
        } else if (data.role === "paciente") {
          connectedPatients[key] = ws;
          console.log(`✅ Paciente ${key} conectado`);
        }

        console.log("👨‍⚕️ Doctores conectados:", Object.keys(connectedDoctors));
        console.log("🧑‍🦱 Pacientes conectados:", Object.keys(connectedPatients));
      }
    } catch (err) {
      console.error("❌ Error procesando mensaje:", err);
    }
  });

  ws.on("close", () => {
    for (const [username, client] of Object.entries(connectedDoctors)) {
      if (client === ws) {
        delete connectedDoctors[username];
        console.log(`🔌 Doctor ${username} desconectado`);
      }
    }

    for (const [username, client] of Object.entries(connectedPatients)) {
      if (client === ws) {
        delete connectedPatients[username];
        console.log(`🔌 Paciente ${username} desconectado`);
      }
    }
  });
});

// -----------------------------------------------------------------
// Funciones para enviar mensajes

export function sendToDoctor(username: string, payload: any) {
  const key = username.toLowerCase().trim();
  const doctor = connectedDoctors[key];
  if (doctor && doctor.readyState === WebSocket.OPEN) {
    doctor.send(JSON.stringify(payload));
  } else {
    console.warn(`⚠️ Doctor ${key} no conectado`);
  }
}

export function sendToPatient(username: string, payload: any) {
  const key = username.toLowerCase().trim();
  const patient = connectedPatients[key];
  if (patient && patient.readyState === WebSocket.OPEN) {
    patient.send(JSON.stringify(payload));
    console.log(`📤 Enviado a ${key}:`, payload);
  } else {
    console.warn(`⚠️ Paciente ${key} no conectado`);
  }
}

export function broadcastSpO2(spo2: number) {
  const message = JSON.stringify({ spo2 });
  Object.values(connectedPatients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// -----------------------------------------------------------------
// Iniciar servidor
const PORT: number = 3000;
server.listen(PORT, () => {
  console.log(`# Servidor Express + WebSocket corriendo en http://localhost:${PORT}`);
});


/*import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import userDoctorRoutes from './routes/userDoctorRoutes';
import userAdminRoutes from './routes/userAdminRoutes';
import irRoutes from './routes/irRoutes';
import { startBLEListener } from './bluetooth/bleListener';

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas REST
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '# API funcionando correctamente' });
});
app.use('/api/users', userRoutes);
app.use('/api/doctors', userDoctorRoutes);
app.use('/api/admin', userAdminRoutes);
app.use('/api/oxi', irRoutes);

// Iniciar BLE
startBLEListener();

// -----------------------------------------------------------------
// Servidor HTTP
const server = http.createServer(app);

// -----------------------------------------------------------------
// WebSocket Servers
const doctorWSS = new WebSocketServer({ server, path: "/doctor" });
const patientWSS = new WebSocketServer({ server, path: "/paciente" });



// Diccionarios de conexiones
//let connectedDoctors: Record<string, WebSocket> = {};
//let connectedPatients: Record<string, WebSocket> = {};

// -----------------------------------------------------------------
// Conexión de doctores
/*doctorWSS.on("connection", (ws) => {
  console.log("👨‍⚕️ Doctor conectado");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "init" && data.username) {
        const key = data.username.toLowerCase().trim();
        connectedDoctors[key] = ws;
        console.log(`✅ Doctor ${key} registrado`);
        console.log("🔍 Doctores conectados:", Object.keys(connectedDoctors));
      }
    } catch (err) {
      console.error("❌ Error procesando mensaje WS Doctor:", err);
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
});*/

// -----------------------------------------------------------------
// Conexión de pacientes
/*patientWSS.on("connection", (ws, req) => {
  console.log("🧑‍🦱 Paciente conectado desde:", req.socket.remoteAddress);

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log("🔍 DATA recibida:", data);

      if (data.type === "init" && data.username) {
        const key = data.username.toLowerCase().trim();
        connectedPatients[key] = ws;
        console.log(`✅ Paciente ${key} registrado`);
        console.log("🔍 Pacientes conectados:", Object.keys(connectedPatients));
      }
    } catch (err) {
      console.error("❌ Error procesando mensaje WS Paciente:", err);
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
});*/


// -----------------------------------------------------------------
// Enviar a un doctor específico
/*export function sendToDoctor(username: string, payload: any) {
  const key = username.toLowerCase().trim();
  const doctor = connectedDoctors[key];
  if (doctor && doctor.readyState === WebSocket.OPEN) {
    doctor.send(JSON.stringify(payload));
  } else {
    console.warn(`⚠️ Doctor ${key} no conectado`);
  }
}*/

// Enviar a un paciente específico
/*export function sendToPatient(username: string, payload: any) {
  const key = username.toLowerCase().trim();
  const patient = connectedPatients[key];
  if (patient && patient.readyState === WebSocket.OPEN) {
    patient.send(JSON.stringify(payload));
    console.log(`📤 Enviado a ${key}:`, payload);
  } else {
    console.warn(`⚠️ Paciente ${key} no conectado`);
    console.log("🔍 Pacientes conectados:", Object.keys(connectedPatients));
  }
}*/

// Broadcast a todos los pacientes
/*export function broadcastSpO2(spo2: number) {
  const message = JSON.stringify({ spo2 });
  Object.values(connectedPatients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}*/

// -----------------------------------------------------------------
// Iniciar servidor
/*const PORT: number = 3000;
server.listen(PORT, () => {
  console.log(`# Servidor Express + WebSocket corriendo en http://localhost:${PORT}`);
});*/
