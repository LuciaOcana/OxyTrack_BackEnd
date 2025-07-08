// src/ble/bleListener.ts
import noble, { Peripheral, Characteristic } from '@abandonware/noble';
import { processSample  } from '../controllers/IRController'; // 👈 Importa la función que procesa IR

const SERVICE_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const CHARACTERISTIC_UUID = '9c858901-8a57-4791-81fe-4c455b099bc9';

let connectedPeripheral: Peripheral | null = null;
let dataCharacteristic: Characteristic | null = null;

function handleData(data: Buffer) {
  const value = data.toString().trim();

  // Si recibimos "51234,49876"
  const parts = value.split(',');
  if (parts.length === 2) {
    const ir = parseInt(parts[0], 10);
    const red = parseInt(parts[1], 10);

    if (!isNaN(ir) && !isNaN(red)) {
      console.log(`📥 IR: ${ir}, RED: ${red}`);
      processSample(ir, red); // ✅ usa nueva función
    } else {
      console.warn(`⚠️ Datos no numéricos recibidos: "${value}"`);
    }

  } else if (value === '1') {
    console.log('🟢 ESP32: Conectado');
  } else if (value === '0') {
    console.log('🔴 ESP32: Desconectado');
  } else {
    console.warn(`⚠️ Valor desconocido recibido: "${value}"`);
  }
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
      console.log('📡 Suscripción activada para notificaciones BLE');

      const handleData = (data: Buffer) => {
        const value = data.toString().trim();
        const parts = value.split(',');
        if (parts.length === 2) {
          const ir = parseInt(parts[0], 10);
          const red = parseInt(parts[1], 10);

          if (!isNaN(ir) && !isNaN(red)) {
            console.log(`📥 IR: ${ir}, RED: ${red}`);
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
