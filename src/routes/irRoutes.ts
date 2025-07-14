import express from 'express';
import { receiveIRRedData, getLatestSpO2 } from '../controllers/IRController';

const router = express.Router();

router.post('/oximetro/:ir', receiveIRRedData);  // ← Coincide con el endpoint del ESP32
router.get('/oximetro/:spo2', getLatestSpO2);

export default router;
