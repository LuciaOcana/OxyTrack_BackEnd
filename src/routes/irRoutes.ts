import express from 'express';
import { receiveIRData } from '../controllers/IRController';

const router = express.Router();

router.post('/oximetro/:ir', receiveIRData);  // ← Coincide con el endpoint del ESP32

export default router;
