import express from 'express';
import { /*receiveIRRedData,*/ getLatestSpO2 } from '../controllers/IRController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

//router.post('/oximetro/:ir', receiveIRRedData);  // ← Coincide con el endpoint del ESP32
router.get('/oximetro/latest',authenticateJWT, getLatestSpO2);    // Consultar último SpO₂

export default router;
