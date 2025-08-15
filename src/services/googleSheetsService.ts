// src/services/googleSheetsService.ts
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Validación de credencial
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  throw new Error('❌ GOOGLE_APPLICATION_CREDENTIALS no está definida en el entorno');
}

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Inserta una nueva medida de SpO₂ en Google Sheets
 * Hoja: Usuario | Fecha | Hora | SpO₂
 */
export async function insertSpO2ToSheet(
  username: string,
  spo2: number,
  spreadsheetId: string,
  sheetName: string
) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];
  const newRow = [username, dateStr, timeStr, spo2];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A2:D`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [newRow],
      },
    });

    console.log(`✅ SpO₂ añadido a Google Sheets para ${username}`);
  } catch (error) {
    console.error('❌ Error al guardar SpO₂ en Google Sheets:', error);
    throw error;
  }
}

/**
 * Inserta valores IR y RED en otra hoja de Google Sheets
 * Hoja: Usuario | Fecha | Hora | IR | RED
 */
export async function insertIRRedToSheet(
  username: string,
  ir: number,
  red: number,
  spreadsheetId: string,
  sheetName: string
) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];
  const newRow = [username, dateStr, timeStr, ir, red];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A2:E`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [newRow],
      },
    });

    console.log(`✅ IR/RED añadido a Google Sheets para ${username}`);
  } catch (error) {
    console.error('❌ Error al guardar IR y RED en Google Sheets:', error);
    throw error;
  }
}
