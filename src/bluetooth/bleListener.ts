//Codigo de conexión BLE al microprocesador y 


// src/ble/bleListener.ts
import noble, { Peripheral, Characteristic } from '@abandonware/noble';
import { processSample, getActiveUsername   } from '../controllers/IRController'; // 👈 Importa la función que procesa IR

const SERVICE_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const CHARACTERISTIC_UUID = '9c858901-8a57-4791-81fe-4c455b099bc9';

let loginStatus = 0;
let connectedPeripheral: Peripheral | null = null;
let dataCharacteristic: Characteristic | null = null;

// Función para enviar el estado al ESP32 por BLE
function sendLoginStatusToESP() {
  if (dataCharacteristic) {
    const value = loginStatus.toString(); // "1" o "0"
    dataCharacteristic.write(Buffer.from(value), false);
    console.log(`( Estado del Log In = ${value} )`);
  } else {
    console.log('⚠️ No se pudo enviar loginStatus: dataCharacteristic no disponible');
  }
}

// Actualizar el estado del LogIn desde cualquie fichero externo
export function setLoginStatus(status: number) {
  loginStatus = status === 1 ? 1 : 0;
  console.log(`( Estado del Log In actualizado a: ${loginStatus} )`);
  sendLoginStatusToESP(); // Notificar al ESP32 en tiempo real
}

export function getLoginStatus() {
  return loginStatus;
}

export function startBLEListener() {
  noble.on('stateChange', async (state: string) => {
    if (state === 'poweredOn') {
      console.log('🔍 Escaneando dispositivos BLE...');
      noble.startScanning([SERVICE_UUID], false);
    } else {
      noble.stopScanning();
    }
  });

  noble.on('discover', async (peripheral: Peripheral) => {
    console.log(`📡 Dispositivo encontrado: ${peripheral.advertisement.localName || peripheral.id}`);
    noble.stopScanning();

    try {
      await peripheral.connectAsync();
      console.log('✅ ESP32 conectado');
      connectedPeripheral = peripheral;

      const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
        [SERVICE_UUID],
        [CHARACTERISTIC_UUID]
      );

      dataCharacteristic = characteristics[0];
      await dataCharacteristic.subscribeAsync();
      console.log(' * Notificaciones BLE activadas: datos nuevos llegarán automáticamente desde el ESP32 *');

// ✅ Notificamos el estado de login actual
      sendLoginStatusToESP();

      const handleData = (data: Buffer) => {
        const value = data.toString().trim();
        const parts = value.split(',');
        if (parts.length === 2) {
          const ir = parseInt(parts[0], 10);
          const red = parseInt(parts[1], 10);

          if (!isNaN(ir) && !isNaN(red)) {
            processSample(ir, red); // 👈 función actualizada en tu controller
          } else {
            console.warn(`⚠️ Datos no numéricos recibidos: "${value}"`);
          }
        } else if (value === '1') {
          console.log('🟢 ESP32: Conectado');
        } else if (value === '0') {
          console.log('🔴 ESP32: Desconectado');
        } else {
          console.warn(`⚠️ Valor desconocido recibido: ${value}`);
        }
      };

      dataCharacteristic.on('data', handleData);

      peripheral.once('disconnect', async () => {
        console.log('⚠️ ESP32 desconectado');

        try {
          dataCharacteristic?.removeListener('data', handleData);
          await dataCharacteristic?.unsubscribeAsync();
        } catch (e) {
          console.warn('⚠️ Error al desuscribirse o limpiar listeners:', e);
        }

        connectedPeripheral = null;
        dataCharacteristic = null;

        setTimeout(() => {
          console.log('🔍 Reiniciando escaneo BLE...');
          noble.startScanning([SERVICE_UUID], false);
        }, 2000);
      });

    } catch (error) {
      console.error('❌ Error al conectar al ESP32:', error);
    }
  });
}

// Función exportada para forzar envío cuando cambia el estado de login
export function updateLoginStatusBLE() {
  sendLoginStatusToESP();
}
