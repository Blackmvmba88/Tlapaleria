// Rutas para backup a Google Drive
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const db = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Configurar Google Drive API
function getAuthClient() {
  const credentials = process.env.GOOGLE_DRIVE_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS)
    : null;

  if (!credentials) {
    throw new Error('Credenciales de Google Drive no configuradas');
  }

  const { client_email, private_key } = credentials;
  
  return new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/drive.file']
  );
}

// Crear backup de la base de datos
router.post('/crear', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const dbPath = path.join(__dirname, '../../tlapaleria.db');
    const backupDir = path.join(__dirname, '../../backups');
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFileName = `tlapaleria_backup_${fecha}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // Copiar base de datos
    fs.copyFileSync(dbPath, backupPath);
    const stats = fs.statSync(backupPath);

    res.json({
      mensaje: 'Backup local creado exitosamente',
      archivo: backupFileName,
      tamano: stats.size,
      ruta: backupPath
    });
  } catch (error) {
    console.error('Error al crear backup:', error);
    res.status(500).json({ error: 'Error al crear backup', detalle: error.message });
  }
});

// Subir backup a Google Drive
router.post('/subir-drive', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { archivo } = req.body;
    
    if (!archivo) {
      return res.status(400).json({ error: 'Nombre de archivo requerido' });
    }

    const backupPath = path.join(__dirname, '../../backups', archivo);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Archivo de backup no encontrado' });
    }

    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: archivo,
      mimeType: 'application/x-sqlite3'
    };

    const media = {
      mimeType: 'application/x-sqlite3',
      body: fs.createReadStream(backupPath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, size'
    });

    const stats = fs.statSync(backupPath);

    // Guardar información del backup en la base de datos
    db.run(
      'INSERT INTO backups (archivo_id, nombre_archivo, tamano) VALUES (?, ?, ?)',
      [response.data.id, response.data.name, stats.size],
      function(err) {
        if (err) {
          console.error('Error al guardar registro de backup:', err);
        }
      }
    );

    res.json({
      mensaje: 'Backup subido a Google Drive exitosamente',
      archivo_id: response.data.id,
      nombre: response.data.name,
      tamano: response.data.size
    });
  } catch (error) {
    console.error('Error al subir a Google Drive:', error);
    res.status(500).json({ 
      error: 'Error al subir a Google Drive', 
      detalle: error.message 
    });
  }
});

// Crear y subir backup en un solo paso
router.post('/backup-completo', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const dbPath = path.join(__dirname, '../../tlapaleria.db');
    const backupDir = path.join(__dirname, '../../backups');
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFileName = `tlapaleria_backup_${fecha}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // Copiar base de datos
    fs.copyFileSync(dbPath, backupPath);
    const stats = fs.statSync(backupPath);

    // Subir a Google Drive
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: backupFileName,
      mimeType: 'application/x-sqlite3'
    };

    const media = {
      mimeType: 'application/x-sqlite3',
      body: fs.createReadStream(backupPath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, size'
    });

    // Guardar información del backup en la base de datos
    db.run(
      'INSERT INTO backups (archivo_id, nombre_archivo, tamano) VALUES (?, ?, ?)',
      [response.data.id, response.data.name, stats.size]
    );

    res.json({
      mensaje: 'Backup creado y subido exitosamente',
      archivo_id: response.data.id,
      nombre: backupFileName,
      tamano: stats.size,
      ruta_local: backupPath
    });
  } catch (error) {
    console.error('Error al crear backup completo:', error);
    res.status(500).json({ 
      error: 'Error al crear backup completo', 
      detalle: error.message 
    });
  }
});

// Obtener lista de backups
router.get('/lista', verificarToken, verificarAdmin, (req, res) => {
  db.all(
    'SELECT * FROM backups ORDER BY fecha_backup DESC',
    [],
    (err, backups) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener lista de backups' });
      }
      res.json(backups);
    }
  );
});

// Listar backups desde Google Drive
router.get('/lista-drive', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: "mimeType='application/x-sqlite3' and trashed=false",
      fields: 'files(id, name, size, createdTime, modifiedTime)',
      orderBy: 'createdTime desc'
    });

    res.json(response.data.files);
  } catch (error) {
    console.error('Error al listar backups de Google Drive:', error);
    res.status(500).json({ 
      error: 'Error al listar backups de Google Drive', 
      detalle: error.message 
    });
  }
});

module.exports = router;
