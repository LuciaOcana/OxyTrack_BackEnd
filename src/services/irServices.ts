// src/services/irService.ts
import { insertSpO2ToSheet } from './googleSheetsService';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Medidas';

export async function saveSpO2ForUser(username: string, spo2: number) {
  try {
    await insertSpO2ToSheet(username, spo2, SPREADSHEET_ID, SHEET_NAME);
    console.log(`☁️ Medida SpO₂ guardada en Google Sheets para ${username}`);
  } catch (error) {
    console.error('❌ Error al guardar SpO₂ en Google Sheets:', error);
  }
}
