// Factory para crear adaptador de base de datos (SQLite o PostgreSQL)
const path = require('path');

// Cargar el tipo de base de datos desde variables de entorno
const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'sqlite' o 'postgres'

let db;

if (DB_TYPE === 'postgres') {
  // Usar PostgreSQL
  const PostgresDatabase = require('./postgres');
  const pgDb = new PostgresDatabase();
  
  // Adaptador para que PostgreSQL tenga la misma interfaz que SQLite
  db = {
    run: (sql, params, callback) => {
      pgDb.run(sql, params)
        .then(result => callback && callback(null, result))
        .catch(err => callback && callback(err));
    },
    get: (sql, params, callback) => {
      pgDb.get(sql, params)
        .then(row => callback && callback(null, row))
        .catch(err => callback && callback(err));
    },
    all: (sql, params, callback) => {
      pgDb.all(sql, params)
        .then(rows => callback && callback(null, rows))
        .catch(err => callback && callback(err));
    },
    close: () => pgDb.close(),
    // Añadir referencia directa para uso con await
    query: pgDb,
    type: 'postgres'
  };
  
  console.log('✅ Base de datos configurada: PostgreSQL');
} else {
  // Usar SQLite (predeterminado)
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = path.join(__dirname, '../../tlapaleria.db');

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error al conectar con SQLite:', err.message);
    } else {
      console.log('✅ Base de datos configurada: SQLite');
      initializeTables();
    }
  });

  db.type = 'sqlite';
}

// Inicializar tablas para SQLite
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

  console.log('✅ Tablas de SQLite inicializadas correctamente.');
}

module.exports = db;
