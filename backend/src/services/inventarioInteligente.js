// Servicio de inventario inteligente con predicciones y alertas
const db = require('../config/database');

class InventarioInteligenteService {
  
  /**
   * Predice la demanda futura de un producto basado en historial de ventas
   * @param {number} productoId - ID del producto
   * @param {number} dias - Número de días hacia atrás para analizar (default: 30)
   * @returns {Promise<object>} Predicción de demanda
   */
  static async predecirDemanda(productoId, dias = 30) {
    return new Promise((resolve, reject) => {
      // Validar y sanitizar el parámetro dias
      const diasValidados = Math.max(1, Math.min(365, parseInt(dias) || 30));
      
      const query = `
        SELECT 
          COUNT(*) as num_ventas,
          SUM(cantidad) as total_vendido,
          AVG(cantidad) as promedio_por_venta,
          MIN(fecha_venta) as primera_venta,
          MAX(fecha_venta) as ultima_venta
        FROM ventas
        WHERE producto_id = ?
        AND fecha_venta >= datetime('now', ? || ' days')
      `;
      
      db.get(query, [productoId, `-${diasValidados}`], (err, row) => {
        if (err) {
          reject(err);
        } else {
          const ventasPorDia = row.total_vendido / diasValidados;
          const prediccionSemanal = ventasPorDia * 7;
          const prediccionMensual = ventasPorDia * 30;
          
          resolve({
            productoId,
            periodo_analizado: diasValidados,
            ventas_totales: row.total_vendido || 0,
            numero_transacciones: row.num_ventas || 0,
            promedio_por_venta: row.promedio_por_venta || 0,
            ventas_por_dia: ventasPorDia || 0,
            prediccion_semanal: Math.ceil(prediccionSemanal),
            prediccion_mensual: Math.ceil(prediccionMensual),
            primera_venta: row.primera_venta,
            ultima_venta: row.ultima_venta
          });
        }
      });
    });
  }

  /**
   * Calcula el punto de reorden óptimo para un producto
   * @param {number} productoId - ID del producto
   * @returns {Promise<object>} Información de reorden
   */
  static async calcularPuntoReorden(productoId) {
    try {
      // Obtener información del producto
      const producto = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM productos WHERE id = ?', [productoId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Obtener predicción de demanda
      const demanda = await this.predecirDemanda(productoId, 30);
      
      // Calcular punto de reorden (días de stock de seguridad: 7 días)
      const diasStockSeguridad = 7;
      const puntoReorden = Math.ceil(demanda.ventas_por_dia * diasStockSeguridad);
      const cantidadOptima = Math.ceil(demanda.prediccion_mensual * 1.2); // 20% buffer
      
      const necesitaReorden = producto.stock_actual <= puntoReorden;
      const cantidadSugerida = necesitaReorden ? 
        Math.max(cantidadOptima - producto.stock_actual, 0) : 0;
      
      return {
        producto_id: productoId,
        nombre: producto.nombre,
        stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo,
        punto_reorden: puntoReorden,
        necesita_reorden: necesitaReorden,
        cantidad_sugerida: cantidadSugerida,
        demanda_diaria: demanda.ventas_por_dia,
        prediccion_mensual: demanda.prediccion_mensual,
        dias_stock_restante: producto.stock_actual / (demanda.ventas_por_dia || 1)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Genera alertas de stock para todos los productos
   * @returns {Promise<Array>} Lista de productos con alertas
   */
  static async generarAlertas() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*,
          COALESCE(SUM(v.cantidad), 0) as ventas_ultimo_mes
        FROM productos p
        LEFT JOIN ventas v ON p.id = v.producto_id 
          AND v.fecha_venta >= datetime('now', '-30 days')
        GROUP BY p.id
        HAVING p.stock_actual <= p.stock_minimo
        ORDER BY (p.stock_actual * 1.0 / NULLIF(p.stock_minimo, 0)) ASC
      `;
      
      db.all(query, [], async (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Enriquecer con información de reorden
          const alertas = await Promise.all(
            rows.map(async (producto) => {
              try {
                const reorden = await this.calcularPuntoReorden(producto.id);
                return {
                  ...producto,
                  nivel_alerta: this.calcularNivelAlerta(producto.stock_actual, producto.stock_minimo),
                  reorden_info: reorden
                };
              } catch (error) {
                return {
                  ...producto,
                  nivel_alerta: this.calcularNivelAlerta(producto.stock_actual, producto.stock_minimo),
                  reorden_info: null
                };
              }
            })
          );
          resolve(alertas);
        }
      });
    });
  }

  /**
   * Calcula el nivel de alerta basado en stock actual vs mínimo
   * @param {number} stockActual 
   * @param {number} stockMinimo 
   * @returns {string} Nivel de alerta: 'critico', 'alto', 'medio', 'bajo'
   */
  static calcularNivelAlerta(stockActual, stockMinimo) {
    const ratio = stockActual / (stockMinimo || 1);
    
    if (ratio <= 0.25) return 'critico';
    if (ratio <= 0.5) return 'alto';
    if (ratio <= 0.75) return 'medio';
    return 'bajo';
  }

  /**
   * Analiza productos de lento movimiento
   * @param {number} dias - Días sin ventas para considerar lento movimiento
   * @returns {Promise<Array>} Productos de lento movimiento
   */
  static async analizarLentoMovimiento(dias = 60) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*,
          MAX(v.fecha_venta) as ultima_venta,
          COALESCE(SUM(v.cantidad), 0) as ventas_totales,
          julianday('now') - julianday(MAX(v.fecha_venta)) as dias_sin_venta
        FROM productos p
        LEFT JOIN ventas v ON p.id = v.producto_id
        GROUP BY p.id
        HAVING ultima_venta IS NULL 
          OR dias_sin_venta > ?
        ORDER BY dias_sin_venta DESC
      `;
      
      db.all(query, [dias], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            recomendacion: this.generarRecomendacionLentoMovimiento(row)
          })));
        }
      });
    });
  }

  /**
   * Genera recomendación para producto de lento movimiento
   * @param {object} producto 
   * @returns {string} Recomendación
   */
  static generarRecomendacionLentoMovimiento(producto) {
    const diasSinVenta = producto.dias_sin_venta || 0;
    
    if (diasSinVenta > 180) {
      return 'Considerar descontinuar o hacer liquidación';
    } else if (diasSinVenta > 120) {
      return 'Aplicar descuento agresivo para mover inventario';
    } else if (diasSinVenta > 60) {
      return 'Promocionar o aplicar descuento moderado';
    }
    return 'Monitorear de cerca';
  }

  /**
   * Calcula el valor total del inventario
   * @returns {Promise<object>} Información del valor del inventario
   */
  static async calcularValorInventario() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_productos,
          SUM(stock_actual) as unidades_totales,
          SUM(stock_actual * precio) as valor_total,
          AVG(precio) as precio_promedio,
          SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) as productos_bajo_stock
        FROM productos
      `;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total_productos: row.total_productos || 0,
            unidades_totales: row.unidades_totales || 0,
            valor_total: row.valor_total || 0,
            precio_promedio: row.precio_promedio || 0,
            productos_bajo_stock: row.productos_bajo_stock || 0
          });
        }
      });
    });
  }

  /**
   * Obtiene productos más rentables
   * @param {number} limit - Número de productos a retornar
   * @returns {Promise<Array>} Productos ordenados por rentabilidad
   */
  static async obtenerProductosRentables(limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*,
          COUNT(v.id) as num_ventas,
          SUM(v.cantidad) as unidades_vendidas,
          SUM(v.total) as ingresos_totales,
          AVG(v.precio_unitario) as precio_promedio_venta
        FROM productos p
        LEFT JOIN ventas v ON p.id = v.producto_id
        WHERE v.fecha_venta >= datetime('now', '-30 days')
        GROUP BY p.id
        HAVING num_ventas > 0
        ORDER BY ingresos_totales DESC
        LIMIT ?
      `;
      
      db.all(query, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = InventarioInteligenteService;
