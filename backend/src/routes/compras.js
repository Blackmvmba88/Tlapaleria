// Rutas para gestión de compras futuras
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todas las compras futuras
router.get('/', verificarToken, (req, res) => {
  const { estado, prioridad } = req.query;
  
  let query = `
    SELECT cf.*, p.nombre as producto_nombre, p.proveedor, p.stock_actual, p.stock_minimo
    FROM compras_futuras cf
    JOIN productos p ON cf.producto_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (estado) {
    query += ' AND cf.estado = ?';
    params.push(estado);
  }

  if (prioridad) {
    query += ' AND cf.prioridad = ?';
    params.push(prioridad);
  }

  query += ' ORDER BY CASE cf.prioridad WHEN "alta" THEN 1 WHEN "media" THEN 2 WHEN "baja" THEN 3 END, cf.fecha_solicitud DESC';

  db.all(query, params, (err, compras) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener compras futuras' });
    }
    res.json(compras);
  });
});

// Crear solicitud de compra
router.post('/', verificarToken, (req, res) => {
  const { producto_id, cantidad_solicitada, prioridad } = req.body;

  if (!producto_id || !cantidad_solicitada) {
    return res.status(400).json({ error: 'Producto y cantidad son requeridos' });
  }

  // Verificar que el producto existe
  db.get('SELECT * FROM productos WHERE id = ?', [producto_id], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar producto' });
    }
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    db.run(
      'INSERT INTO compras_futuras (producto_id, cantidad_solicitada, prioridad) VALUES (?, ?, ?)',
      [producto_id, cantidad_solicitada, prioridad || 'media'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al crear solicitud de compra' });
        }
        res.status(201).json({
          id: this.lastID,
          mensaje: 'Solicitud de compra creada exitosamente'
        });
      }
    );
  });
});

// Actualizar estado de compra
router.put('/:id', verificarToken, (req, res) => {
  const { estado, prioridad } = req.body;

  if (!estado && !prioridad) {
    return res.status(400).json({ error: 'Estado o prioridad son requeridos' });
  }

  let query = 'UPDATE compras_futuras SET';
  const params = [];
  const updates = [];

  if (estado) {
    updates.push(' estado = ?');
    params.push(estado);
    
    if (estado === 'completado') {
      updates.push(' fecha_completado = CURRENT_TIMESTAMP');
    }
  }

  if (prioridad) {
    updates.push(' prioridad = ?');
    params.push(prioridad);
  }

  query += updates.join(',');
  query += ' WHERE id = ?';
  params.push(req.params.id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar compra' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    res.json({ mensaje: 'Compra actualizada exitosamente' });
  });
});

// Eliminar solicitud de compra
router.delete('/:id', verificarToken, (req, res) => {
  db.run('DELETE FROM compras_futuras WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar compra' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    res.json({ mensaje: 'Compra eliminada exitosamente' });
  });
});

// Generar automáticamente solicitudes de compra para productos con stock bajo
router.post('/auto-generar', verificarToken, (req, res) => {
  // Buscar productos con stock bajo que no tengan solicitud pendiente
  const query = `
    SELECT p.id, p.nombre, p.stock_minimo, p.stock_actual
    FROM productos p
    WHERE p.stock_actual <= p.stock_minimo
    AND p.id NOT IN (
      SELECT producto_id FROM compras_futuras WHERE estado = 'pendiente'
    )
  `;

  db.all(query, [], (err, productos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar productos' });
    }

    if (productos.length === 0) {
      return res.json({ mensaje: 'No hay productos con stock bajo sin solicitud', generadas: 0 });
    }

    let procesados = 0;
    let generadas = 0;

    productos.forEach(producto => {
      // Calcular cantidad a solicitar (el doble del stock mínimo menos el stock actual)
      const cantidadSolicitada = Math.max(producto.stock_minimo * 2 - producto.stock_actual, producto.stock_minimo);
      
      // Determinar prioridad según el stock actual
      let prioridad = 'media';
      if (producto.stock_actual === 0) {
        prioridad = 'alta';
      } else if (producto.stock_actual < producto.stock_minimo / 2) {
        prioridad = 'alta';
      }

      db.run(
        'INSERT INTO compras_futuras (producto_id, cantidad_solicitada, prioridad) VALUES (?, ?, ?)',
        [producto.id, cantidadSolicitada, prioridad],
        function(err) {
          procesados++;
          if (!err) {
            generadas++;
          }

          if (procesados === productos.length) {
            res.json({
              mensaje: `Se generaron ${generadas} solicitudes de compra automáticamente`,
              generadas
            });
          }
        }
      );
    });
  });
});

module.exports = router;
