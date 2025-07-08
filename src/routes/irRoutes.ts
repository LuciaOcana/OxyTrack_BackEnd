import express from 'express';
import { receiveIRRedData } from '../controllers/IRController';

const router = express.Router();

router.post('/oximetro/:ir', receiveIRRedData);  // ← Coincide con el endpoint del ESP32

export default router;
