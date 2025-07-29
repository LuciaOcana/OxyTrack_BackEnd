// src/services/irServices.ts
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function saveSpO2ForUser(username: string, spo2: number) {
  try {
    const fileName = `spo2_${username}.txt`;
    const localDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localPath = path.join(localDir, fileName);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16); // Fecha legible
    const newEntry = `${spo2}% (${timestamp})`;

    // 1. Buscar si ya existe en Drive
    const list = await drive.files.list({
      q: `name='${fileName}' and mimeType='text/plain' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    let fileId: string | null = null;

    if (list.data.files && list.data.files.length > 0) {
      fileId = list.data.files[0]?.id ?? null;

      // 2. Descargar el archivo temporalmente
      if (fileId) {
        const dest = fs.createWriteStream(localPath);
        await drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'stream' }
        ).then(res => {
          return new Promise((resolve, reject) => {
            res.data
              .on('end', () => resolve(true))
              .on('error', reject)
              .pipe(dest);
          });
        });
      }
    } else {
      // Si no existe, creamos un archivo nuevo localmente
      fs.writeFileSync(localPath, '');
    }

    // 3. Leer contenido existente
    let content = '';
    if (fs.existsSync(localPath)) {
      content = fs.readFileSync(localPath, 'utf8').trim();
    }

    const updatedContent = content ? `${content}\t${newEntry}` : newEntry;
    fs.writeFileSync(localPath, updatedContent);

    // 4. Subir (crear o actualizar)
    if (fileId) {
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'text/plain',
          body: fs.createReadStream(localPath),
        },
      });
      console.log(`☁️ Archivo actualizado en Drive: ${fileName}`);
    } else {
      const res = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'text/plain',
        },
        media: {
          mimeType: 'text/plain',
          body: fs.createReadStream(localPath),
        },
      });
      console.log(`☁️ Archivo creado en Drive con ID: ${res.data.id}`);
    }
  } catch (error) {
    console.error('❌ Error al guardar o subir SpO₂:', error);
  }
}
