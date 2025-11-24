// Configuración de PostgreSQL como alternativa a SQLite
const { Pool } = require('pg');

class PostgresDatabase {
  constructor() {
    this.pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      database: process.env.PG_DATABASE || 'tlapaleria',
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || '',
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Error inesperado en el pool de PostgreSQL:', err);
    });

    this.initializeTables();
  }

  // Inicializar tablas en PostgreSQL
  async initializeTables() {
    const client = await this.pool.connect();
    try {
      console.log('Conectado a PostgreSQL. Inicializando tablas...');

      // Tabla de usuarios
      await client.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          google_id TEXT UNIQUE,
          email TEXT UNIQUE NOT NULL,
          nombre TEXT NOT NULL,
          foto TEXT,
          rol TEXT DEFAULT 'trabajador',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS productos (
          id SERIAL PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          codigo_barras TEXT UNIQUE,
          precio NUMERIC(10, 2) NOT NULL,
          stock_actual INTEGER DEFAULT 0,
          stock_minimo INTEGER DEFAULT 10,
          categoria TEXT,
          ubicacion TEXT,
          proveedor TEXT,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de ventas
      await client.query(`
        CREATE TABLE IF NOT EXISTS ventas (
          id SERIAL PRIMARY KEY,
          producto_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          cantidad INTEGER NOT NULL,
          precio_unitario NUMERIC(10, 2) NOT NULL,
          total NUMERIC(10, 2) NOT NULL,
          fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (producto_id) REFERENCES productos(id),
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
      `);

      // Tabla de mensajes
      await client.query(`
        CREATE TABLE IF NOT EXISTS mensajes (
          id SERIAL PRIMARY KEY,
          remitente_id INTEGER NOT NULL,
          destinatario_id INTEGER NOT NULL,
          mensaje TEXT NOT NULL,
          leido INTEGER DEFAULT 0,
          fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (remitente_id) REFERENCES usuarios(id),
          FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
        )
      `);

      // Tabla de encuestas
      await client.query(`
        CREATE TABLE IF NOT EXISTS encuestas (
          id SERIAL PRIMARY KEY,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          activa INTEGER DEFAULT 1,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de respuestas de encuestas
      await client.query(`
        CREATE TABLE IF NOT EXISTS respuestas_encuesta (
          id SERIAL PRIMARY KEY,
          encuesta_id INTEGER NOT NULL,
          pregunta TEXT NOT NULL,
          respuesta TEXT NOT NULL,
          calificacion INTEGER,
          fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (encuesta_id) REFERENCES encuestas(id)
        )
      `);

      // Tabla de compras futuras
      await client.query(`
        CREATE TABLE IF NOT EXISTS compras_futuras (
          id SERIAL PRIMARY KEY,
          producto_id INTEGER NOT NULL,
          cantidad_solicitada INTEGER NOT NULL,
          prioridad TEXT DEFAULT 'media',
          estado TEXT DEFAULT 'pendiente',
          fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_completado TIMESTAMP,
          FOREIGN KEY (producto_id) REFERENCES productos(id)
        )
      `);

      // Tabla de backups
      await client.query(`
        CREATE TABLE IF NOT EXISTS backups (
          id SERIAL PRIMARY KEY,
          archivo_id TEXT,
          nombre_archivo TEXT NOT NULL,
          tamano INTEGER,
          fecha_backup TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tablas de PostgreSQL inicializadas correctamente.');
    } catch (error) {
      console.error('Error al inicializar tablas de PostgreSQL:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Wrapper para ejecutar consultas SQL (compatible con sintaxis SQLite)
  async run(sql, params = []) {
    const client = await this.pool.connect();
    try {
      // Convertir consultas de SQLite a PostgreSQL
      const pgSql = this.convertSqliteToPg(sql);
      const result = await client.query(pgSql, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Wrapper para obtener un único registro
  async get(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const pgSql = this.convertSqliteToPg(sql);
      const result = await client.query(pgSql, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Wrapper para obtener todos los registros
  async all(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const pgSql = this.convertSqliteToPg(sql);
      const result = await client.query(pgSql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Convertir sintaxis de SQLite a PostgreSQL
  convertSqliteToPg(sql) {
    let pgSql = sql;
    
    // Reemplazar datetime('now') con CURRENT_TIMESTAMP
    pgSql = pgSql.replace(/datetime\('now'[^)]*\)/gi, 'CURRENT_TIMESTAMP');
    
    // Reemplazar julianday con EXTRACT(EPOCH FROM ...)
    pgSql = pgSql.replace(/julianday\('now'\)/gi, "EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) / 86400");
    pgSql = pgSql.replace(/julianday\(([^)]+)\)/gi, "EXTRACT(EPOCH FROM $1) / 86400");
    
    // Reemplazar AUTOINCREMENT con SERIAL (esto ya está en las definiciones de tabla)
    pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
    
    // Reemplazar REAL con NUMERIC
    pgSql = pgSql.replace(/\bREAL\b/gi, 'NUMERIC(10,2)');
    
    // Reemplazar DATETIME con TIMESTAMP
    pgSql = pgSql.replace(/\bDATETIME\b/gi, 'TIMESTAMP');
    
    return pgSql;
  }

  // Cerrar el pool de conexiones
  async close() {
    await this.pool.end();
    console.log('Pool de PostgreSQL cerrado.');
  }
}

module.exports = PostgresDatabase;
