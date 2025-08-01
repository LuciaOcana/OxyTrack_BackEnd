/*import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Ruta al archivo JSON de credenciales que descargaste de Google Cloud Console
const CREDENTIALS_PATH = path.join(__dirname, '../credentials/google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '../credentials/token.json');

// Scope para Google Drive (acceso completo a Drive)
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Autenticación OAuth2
async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Leer token guardado
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  throw new Error('No token found, debes generar un token OAuth2 y guardarlo en token.json');
}

// Función para subir un archivo a Google Drive en una carpeta específica
export async function uploadFileToDrive(
  auth: any,
  fileName: string,
  filePath: string,
  folderId: string
) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [folderId], // ID de la carpeta en Drive
  };

  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    console.log(`Archivo subido con ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('Error subiendo archivo a Drive:', error);
    throw error;
  }
}

// Función auxiliar para obtener el cliente autenticado (para usar desde fuera)
export async function getDriveAuthClient() {
  return await authenticate();
}
*/