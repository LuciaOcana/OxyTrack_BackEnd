// src/wifi/wifiListener.ts
import axios from 'axios';
import { processSample } from '../controllers/IRController';

let loginStatus = 0;
//const ESP32_IP = '172.20.10.10'; // Cambia por la IP de tu ESP32
const ESP32_IP = '192.168.1.57';
let pollingInterval: ReturnType<typeof setInterval> | null = null;

//---------------------------------------------------------
// Función para obtener datos del ESP32 cada X segundos
//---------------------------------------------------------
async function fetchESP32Data() {
  try {
    const response = await axios.get(`http://${ESP32_IP}/`);
    const value = response.data?.toString().trim();

    if (!value) return;

    const parts = value.split(',');
    if (parts.length === 2) {
      const ir = parseInt(parts[0], 10);
      const red = parseInt(parts[1], 10);
      if (!isNaN(ir) && !isNaN(red)) {
        processSample(ir, red);
      } else {
        console.warn(`⚠️ Datos no numéricos recibidos: "${value}"`);
      }
    } else {
      console.warn(`⚠️ Valor inesperado recibido: "${value}"`);
    }
  } catch (error) {
    console.error('❌ Error al obtener datos del ESP32:', (error as Error).message);
  }
}

//---------------------------------------------------------
// Funciones para controlar el "loginStatus"
//---------------------------------------------------------
export function setLoginStatus(status: number) {
  loginStatus = status === 1 ? 1 : 0;
  console.log(`( Estado del Log In actualizado a: ${loginStatus} )`);
  sendLoginStatusToESP(); // Notificar al ESP32
}

export function getLoginStatus() {
  return loginStatus;
}

//---------------------------------------------------------
// Notificación al ESP32 por HTTP
//---------------------------------------------------------
export async function sendLoginStatusToESP() {
  try {
    if (loginStatus === 1) {
      // Login + Start
      await axios.get(`http://${ESP32_IP}/login`);
      await axios.get(`http://${ESP32_IP}/start`);
      console.log('✅ Login + Start enviados al ESP32');
    } else {
      // Stop + Logout
      await axios.get(`http://${ESP32_IP}/stop`);
      await axios.get(`http://${ESP32_IP}/logout`);
      console.log('🛑 Stop + Logout enviados al ESP32');
    }
  } catch (err) {
    console.warn('⚠️ No se pudo enviar loginStatus al ESP32:', (err as Error).message);
  }
}

//---------------------------------------------------------
// Iniciar y detener el polling
//---------------------------------------------------------
export function startWiFiListener(pollingMs = 10000) {
  console.log('📡 Iniciando listener Wi-Fi para ESP32...');

  // Forzar envío inicial de loginStatus
  sendLoginStatusToESP();

  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(fetchESP32Data, pollingMs);
}

export function stopWiFiListener() {
  if (pollingInterval) clearInterval(pollingInterval);
}
