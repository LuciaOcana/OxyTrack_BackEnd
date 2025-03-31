// ------------------------------------------------------------
// Gestión de la conexión de la BBDD en aplicaciones de Node.js
// ------------------------------------------------------------

import mongoose from 'mongoose';

// Definición de la URI de conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/OxyTrack'; // Modifica esto según sea necesario

// Función para conectar a la Base de Datos de MongoDB sin .env
const connectDB = async (): Promise<void> => {
    try {
        // Conexión a la base de datos
        await mongoose.connect(mongoURI);
        console.log('# API conectada a MongoDB');
    } catch (error) {
        console.error('# Error al conectar a MongoDB:', error);
        process.exit(1); // Termina el proceso si hay un error en la conexión
    }
};

// Exportar la función de conexión
export default connectDB;
