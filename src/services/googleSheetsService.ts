// src/services/GoogleSheetsService.ts

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Inserta una nueva medida de SpO₂ a Google Sheets y elimina registros antiguos.
 */
export async function insertSpO2ToSheet(
  username: string,
  spo2: number,
  spreadsheetId: string,
  sheetName: string
) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

  const newRow = [username, dateStr, timeStr, spo2];

  try {
    // Obtener registros existentes
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:D`,
    });

    const rows = res.data.values || [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const filteredRows = rows.filter(row => {
      const rowDate = new Date(row[1]);
      return rowDate >= cutoff;
    });

    filteredRows.push(newRow); // Añadir nuevo dato

    // Subir datos de nuevo
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A2`,
      valueInputOption: 'RAW',
      requestBody: {
        values: filteredRows,
      },
    });

    console.log(`✅ SpO₂ añadido a Google Sheets para ${username}`);
  } catch (error) {
    console.error('❌ Error al guardar en Google Sheets:', error);
    throw error;
  }
}
