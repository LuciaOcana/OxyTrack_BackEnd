// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
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

// Puerto de escucha
const PORT: number = 5000;
app.listen(PORT, () => {
    console.log(`# Servidor corriendo en http://localhost:${PORT}`);
});
