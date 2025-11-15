// Rutas para métricas y panel de control (Dashboard de Jesús Morán)
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Calcular media de ventas
function calcularMedia(ventas) {
  if (ventas.length === 0) return 0;
  const suma = ventas.reduce((acc, venta) => acc + venta.total, 0);
  return suma / ventas.length;
}

// Calcular moda (producto más vendido)
function calcularModa(ventas) {
  const frecuencia = {};
  ventas.forEach(venta => {
    frecuencia[venta.producto_id] = (frecuencia[venta.producto_id] || 0) + venta.cantidad;
  });

  let maxFrecuencia = 0;
  let moda = null;

  for (const [producto_id, cantidad] of Object.entries(frecuencia)) {
    if (cantidad > maxFrecuencia) {
      maxFrecuencia = cantidad;
      moda = producto_id;
    }
  }

  return { producto_id: moda, cantidad: maxFrecuencia };
}

// Obtener métricas generales
router.get('/general', verificarToken, (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;
  
  let query = 'SELECT * FROM ventas WHERE 1=1';
  const params = [];

  if (fecha_desde) {
    query += ' AND DATE(fecha_venta) >= DATE(?)';
    params.push(fecha_desde);
  }

  if (fecha_hasta) {
    query += ' AND DATE(fecha_venta) <= DATE(?)';
    params.push(fecha_hasta);
  }

  db.all(query, params, (err, ventas) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener ventas' });
    }

    const media = calcularMedia(ventas);
    const moda = calcularModa(ventas);
    const totalVentas = ventas.reduce((acc, venta) => acc + venta.total, 0);
    const numeroVentas = ventas.length;

    // Obtener información del producto más vendido (moda)
    if (moda.producto_id) {
      db.get('SELECT nombre FROM productos WHERE id = ?', [moda.producto_id], (err, producto) => {
        res.json({
          media_ventas: media.toFixed(2),
          total_ventas: totalVentas.toFixed(2),
          numero_ventas: numeroVentas,
          producto_mas_vendido: {
            id: moda.producto_id,
            nombre: producto ? producto.nombre : 'Desconocido',
            cantidad_vendida: moda.cantidad
          }
        });
      });
    } else {
      res.json({
        media_ventas: media.toFixed(2),
        total_ventas: totalVentas.toFixed(2),
        numero_ventas: numeroVentas,
        producto_mas_vendido: null
      });
    }
  });
});

// Obtener top productos más vendidos
router.get('/top-productos', verificarToken, (req, res) => {
  const { limite = 10, fecha_desde, fecha_hasta } = req.query;
  
  let query = `
    SELECT p.id, p.nombre, p.categoria, 
           SUM(v.cantidad) as total_vendido,
           SUM(v.total) as total_ingresos,
           COUNT(v.id) as numero_ventas
    FROM productos p
    JOIN ventas v ON p.id = v.producto_id
    WHERE 1=1
  `;
  const params = [];

  if (fecha_desde) {
    query += ' AND DATE(v.fecha_venta) >= DATE(?)';
    params.push(fecha_desde);
  }

  if (fecha_hasta) {
    query += ' AND DATE(v.fecha_venta) <= DATE(?)';
    params.push(fecha_hasta);
  }

  query += ' GROUP BY p.id, p.nombre, p.categoria';
  query += ' ORDER BY total_vendido DESC';
  query += ' LIMIT ?';
  params.push(parseInt(limite));

  db.all(query, params, (err, productos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener top productos' });
    }
    res.json(productos);
  });
});

// Obtener ventas por día (para gráficas)
router.get('/ventas-por-dia', verificarToken, (req, res) => {
  const { dias = 30 } = req.query;

  const query = `
    SELECT DATE(fecha_venta) as fecha,
           COUNT(*) as numero_ventas,
           SUM(total) as total_ventas
    FROM ventas
    WHERE fecha_venta >= date('now', '-${parseInt(dias)} days')
    GROUP BY DATE(fecha_venta)
    ORDER BY fecha ASC
  `;

  db.all(query, [], (err, datos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener ventas por día' });
    }
    res.json(datos);
  });
});

// Obtener ventas por categoría
router.get('/ventas-por-categoria', verificarToken, (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;
  
  let query = `
    SELECT p.categoria,
           COUNT(v.id) as numero_ventas,
           SUM(v.total) as total_ventas,
           SUM(v.cantidad) as unidades_vendidas
    FROM ventas v
    JOIN productos p ON v.producto_id = p.id
    WHERE p.categoria IS NOT NULL
  `;
  const params = [];

  if (fecha_desde) {
    query += ' AND DATE(v.fecha_venta) >= DATE(?)';
    params.push(fecha_desde);
  }

  if (fecha_hasta) {
    query += ' AND DATE(v.fecha_venta) <= DATE(?)';
    params.push(fecha_hasta);
  }

  query += ' GROUP BY p.categoria';
  query += ' ORDER BY total_ventas DESC';

  db.all(query, params, (err, categorias) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener ventas por categoría' });
    }
    res.json(categorias);
  });
});

// Obtener inventario actual (resumen)
router.get('/inventario-resumen', verificarToken, (req, res) => {
  const queries = {
    total_productos: 'SELECT COUNT(*) as total FROM productos',
    valor_inventario: 'SELECT SUM(precio * stock_actual) as valor FROM productos',
    productos_bajo_stock: 'SELECT COUNT(*) as total FROM productos WHERE stock_actual <= stock_minimo',
    productos_sin_stock: 'SELECT COUNT(*) as total FROM productos WHERE stock_actual = 0'
  };

  const resultados = {};
  let completados = 0;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], [], (err, resultado) => {
      if (err) {
        resultados[key] = null;
      } else {
        resultados[key] = resultado[Object.keys(resultado)[0]];
      }
      completados++;
      
      if (completados === Object.keys(queries).length) {
        res.json(resultados);
      }
    });
  });
});

// Obtener estadísticas de usuarios (para panel admin)
router.get('/usuarios-stats', verificarToken, verificarAdmin, (req, res) => {
  const query = `
    SELECT u.id, u.nombre, u.rol,
           COUNT(v.id) as total_ventas,
           SUM(v.total) as total_ingresos
    FROM usuarios u
    LEFT JOIN ventas v ON u.id = v.usuario_id
    GROUP BY u.id, u.nombre, u.rol
    ORDER BY total_ventas DESC
  `;

  db.all(query, [], (err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener estadísticas de usuarios' });
    }
    res.json(usuarios);
  });
});

module.exports = router;
