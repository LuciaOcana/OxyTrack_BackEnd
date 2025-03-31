"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./config/db")); // Asegúrate de que la conexión esté configurada correctamente
const userRoutes_1 = __importDefault(require("./routes/userRoutes")); // Importa las rutas de usuario
const app = (0, express_1.default)();
// Conectar a la base de datos MongoDB
(0, db_1.default)();
// Middleware
app.use(express_1.default.json()); // Soporta JSON en las peticiones
app.use((0, cors_1.default)()); // Habilita CORS para el frontend
app.use((0, morgan_1.default)('dev')); // Log de peticiones en consola
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: '# API funcionando correctamente' });
});
// Usar las rutas
app.use('/api/users', userRoutes_1.default); // La ruta para los usuarios será /api/users
// Puerto de escucha
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`# Servidor corriendo en http://localhost:${PORT}`);
});
