// Servicio de almacenamiento offline usando SQLite
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase('tlapaleria_offline.db');

// Inicializar base de datos local
export const initOfflineDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Tabla de productos en caché
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS productos_cache (
          id INTEGER PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          codigo_barras TEXT,
          precio REAL NOT NULL,
          stock_actual INTEGER DEFAULT 0,
          stock_minimo INTEGER DEFAULT 10,
          categoria TEXT,
          ubicacion TEXT,
          proveedor TEXT,
          fecha_actualizacion TEXT
        );`,
        [],
        () => console.log('Tabla productos_cache creada')
      );

      // Tabla de ventas pendientes de sincronización
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ventas_pendientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          producto_id INTEGER NOT NULL,
          cantidad INTEGER NOT NULL,
          precio_unitario REAL NOT NULL,
          total REAL NOT NULL,
          fecha_venta TEXT,
          sincronizado INTEGER DEFAULT 0
        );`,
        [],
        () => console.log('Tabla ventas_pendientes creada')
      );

      // Tabla de métricas en caché
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS metricas_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo TEXT NOT NULL,
          datos TEXT NOT NULL,
          fecha_actualizacion TEXT
        );`,
        [],
        () => {
          console.log('Tabla metricas_cache creada');
          resolve();
        }
      );
    }, reject);
  });
};

// Servicios de productos offline
export const productosOfflineService = {
  // Guardar productos en caché
  guardarCache: (productos) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Limpiar caché anterior
        tx.executeSql('DELETE FROM productos_cache;');
        
        // Insertar nuevos productos
        productos.forEach(producto => {
          tx.executeSql(
            `INSERT INTO productos_cache 
            (id, nombre, descripcion, codigo_barras, precio, stock_actual, stock_minimo, categoria, ubicacion, proveedor, fecha_actualizacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));`,
            [
              producto.id,
              producto.nombre,
              producto.descripcion,
              producto.codigo_barras,
              producto.precio,
              producto.stock_actual,
              producto.stock_minimo,
              producto.categoria,
              producto.ubicacion,
              producto.proveedor,
            ]
          );
        });
      }, reject, resolve);
    });
  },
  
  // Obtener todos los productos de caché
  obtenerCache: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM productos_cache ORDER BY nombre;',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // Buscar producto en caché
  buscarCache: (termino) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM productos_cache 
           WHERE nombre LIKE ? OR descripcion LIKE ? OR codigo_barras LIKE ?
           ORDER BY nombre;`,
          [`%${termino}%`, `%${termino}%`, `%${termino}%`],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });
  },
};

// Servicios de ventas offline
export const ventasOfflineService = {
  // Registrar venta localmente (cuando no hay conexión)
  registrarLocal: (venta) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO ventas_pendientes 
          (producto_id, cantidad, precio_unitario, total, fecha_venta)
          VALUES (?, ?, ?, ?, datetime('now'));`,
          [
            venta.producto_id,
            venta.cantidad,
            venta.precio_unitario,
            venta.total,
          ],
          (_, result) => {
            // Actualizar stock local
            tx.executeSql(
              'UPDATE productos_cache SET stock_actual = stock_actual - ? WHERE id = ?;',
              [venta.cantidad, venta.producto_id],
              () => resolve(result),
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // Obtener ventas pendientes de sincronización
  obtenerPendientes: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM ventas_pendientes WHERE sincronizado = 0;',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // Marcar venta como sincronizada
  marcarSincronizada: (id) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE ventas_pendientes SET sincronizado = 1 WHERE id = ?;',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // Obtener número de ventas pendientes
  contarPendientes: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as total FROM ventas_pendientes WHERE sincronizado = 0;',
          [],
          (_, { rows: { _array } }) => resolve(_array[0]?.total || 0),
          (_, error) => reject(error)
        );
      });
    });
  },
};

// Servicios de métricas offline
export const metricasOfflineService = {
  // Guardar métricas en caché
  guardarCache: (tipo, datos) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO metricas_cache (tipo, datos, fecha_actualizacion)
           VALUES (?, ?, datetime('now'));`,
          [tipo, JSON.stringify(datos)],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // Obtener métricas de caché
  obtenerCache: (tipo) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT datos FROM metricas_cache WHERE tipo = ?;',
          [tipo],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              resolve(JSON.parse(_array[0].datos));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },
};

// Utilidad para verificar estado de conexión
export const checkConnection = async () => {
  try {
    const response = await fetch(`${__DEV__ ? 'http://localhost:3000' : 'https://your-backend-url.com'}/api/health`, {
      method: 'HEAD',
      timeout: 3000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Sincronizar datos cuando vuelva la conexión
export const sincronizarDatos = async (apiService) => {
  try {
    const ventasPendientes = await ventasOfflineService.obtenerPendientes();
    
    const resultados = {
      exitosas: 0,
      fallidas: 0,
      errores: [],
    };
    
    for (const venta of ventasPendientes) {
      try {
        await apiService.ventas.registrar({
          producto_id: venta.producto_id,
          cantidad: venta.cantidad,
          precio_unitario: venta.precio_unitario,
          total: venta.total,
        });
        
        await ventasOfflineService.marcarSincronizada(venta.id);
        resultados.exitosas++;
      } catch (error) {
        resultados.fallidas++;
        resultados.errores.push({
          venta_id: venta.id,
          error: error.message,
        });
      }
    }
    
    return resultados;
  } catch (error) {
    throw new Error(`Error al sincronizar: ${error.message}`);
  }
};

export default {
  initOfflineDB,
  productosOfflineService,
  ventasOfflineService,
  metricasOfflineService,
  checkConnection,
  sincronizarDatos,
};
