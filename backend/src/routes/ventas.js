// Rutas para gestión de ventas
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todas las ventas
router.get('/', verificarToken, (req, res) => {
  const { fecha_desde, fecha_hasta, producto_id } = req.query;
  
  let query = `
    SELECT v.*, p.nombre as producto_nombre, u.nombre as vendedor_nombre
    FROM ventas v
    JOIN productos p ON v.producto_id = p.id
    JOIN usuarios u ON v.usuario_id = u.id
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

  if (producto_id) {
    query += ' AND v.producto_id = ?';
    params.push(producto_id);
  }

  query += ' ORDER BY v.fecha_venta DESC';

  db.all(query, params, (err, ventas) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener ventas' });
    }
    res.json(ventas);
  });
});

// Crear nueva venta
router.post('/', verificarToken, (req, res) => {
  const { producto_id, cantidad, precio_unitario } = req.body;
  const usuario_id = req.usuario.id;

  if (!producto_id || !cantidad || !precio_unitario) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  // Verificar stock disponible
  db.get('SELECT stock_actual FROM productos WHERE id = ?', [producto_id], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar stock' });
    }
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (producto.stock_actual < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    const total = cantidad * precio_unitario;

    // Registrar venta
    db.run(
      'INSERT INTO ventas (producto_id, usuario_id, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)',
      [producto_id, usuario_id, cantidad, precio_unitario, total],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al registrar venta' });
        }

        // Actualizar stock
        db.run(
          'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
          [cantidad, producto_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error al actualizar stock' });
            }

            res.status(201).json({
              id: this.lastID,
              mensaje: 'Venta registrada exitosamente'
            });
          }
        );
      }
    );
  });
});

// Obtener venta por ID
router.get('/:id', verificarToken, (req, res) => {
  db.get(
    `SELECT v.*, p.nombre as producto_nombre, u.nombre as vendedor_nombre
     FROM ventas v
     JOIN productos p ON v.producto_id = p.id
     JOIN usuarios u ON v.usuario_id = u.id
     WHERE v.id = ?`,
    [req.params.id],
    (err, venta) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener venta' });
      }
      if (!venta) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }
      res.json(venta);
    }
  );
});

module.exports = router;
