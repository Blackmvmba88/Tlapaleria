// Configuración de la base de datos SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos
const DB_PATH = path.join(__dirname, '../../tlapaleria.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    initializeTables();
  }
});

// Inicializar tablas
function initializeTables() {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    foto TEXT,
    rol TEXT DEFAULT 'trabajador',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de productos
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    codigo_barras TEXT UNIQUE,
    precio REAL NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 10,
    categoria TEXT,
    ubicacion TEXT,
    proveedor TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de ventas
  db.run(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    total REAL NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);

  // Tabla de mensajes
  db.run(`CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remitente_id INTEGER NOT NULL,
    destinatario_id INTEGER NOT NULL,
    mensaje TEXT NOT NULL,
    leido INTEGER DEFAULT 0,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
  )`);

  // Tabla de encuestas
  db.run(`CREATE TABLE IF NOT EXISTS encuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    activa INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de respuestas de encuestas
  db.run(`CREATE TABLE IF NOT EXISTS respuestas_encuesta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encuesta_id INTEGER NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    calificacion INTEGER,
    fecha_respuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (encuesta_id) REFERENCES encuestas(id)
  )`);

  // Tabla de compras futuras
  db.run(`CREATE TABLE IF NOT EXISTS compras_futuras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    cantidad_solicitada INTEGER NOT NULL,
    prioridad TEXT DEFAULT 'media',
    estado TEXT DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completado DATETIME,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  // Tabla de backups
  db.run(`CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    archivo_id TEXT,
    nombre_archivo TEXT NOT NULL,
    tamano INTEGER,
    fecha_backup DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Tablas inicializadas correctamente.');
}

module.exports = db;
