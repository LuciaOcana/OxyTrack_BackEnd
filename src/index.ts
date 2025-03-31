import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db'; // Asegúrate de que la conexión esté configurada correctamente
import userRoutes from './routes/userRoutes'; // Importa las rutas de usuario

const app = express();

// Conectar a la base de datos MongoDB
connectDB();

// Middleware
app.use(express.json());  // Soporta JSON en las peticiones
app.use(cors());          // Habilita CORS para el frontend
app.use(morgan('dev'));   // Log de peticiones en consola


// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.json({ message: '# API funcionando correctamente' });
});

// Usar las rutas
app.use('/api/users', userRoutes); // La ruta para los usuarios será /api/users

// Puerto de escucha
const PORT: number = 5000;

app.listen(PORT, () => {
    console.log(`# Servidor corriendo en http://localhost:${PORT}`);
});
