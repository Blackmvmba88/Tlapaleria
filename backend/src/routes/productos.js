// Rutas para gestión de productos e inventario
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todos los productos
router.get('/', verificarToken, (req, res) => {
  const { categoria, buscar, bajo_stock } = req.query;
  
  let query = 'SELECT * FROM productos WHERE 1=1';
  const params = [];

  if (categoria) {
    query += ' AND categoria = ?';
    params.push(categoria);
  }

  if (buscar) {
    query += ' AND (nombre LIKE ? OR descripcion LIKE ? OR codigo_barras LIKE ?)';
    const searchTerm = `%${buscar}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (bajo_stock === 'true') {
    query += ' AND stock_actual <= stock_minimo';
  }

  query += ' ORDER BY nombre';

  db.all(query, params, (err, productos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(productos);
  });
});

// Obtener un producto por ID
router.get('/:id', verificarToken, (req, res) => {
  db.get('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener producto' });
    }
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  });
});

// Buscar producto por código de barras
router.get('/barcode/:codigo', verificarToken, (req, res) => {
  db.get('SELECT * FROM productos WHERE codigo_barras = ?', [req.params.codigo], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar producto' });
    }
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  });
});

// Crear nuevo producto
router.post('/', verificarToken, (req, res) => {
  const {
    nombre,
    descripcion,
    codigo_barras,
    precio,
    stock_actual,
    stock_minimo,
    categoria,
    ubicacion,
    proveedor
  } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  db.run(
    `INSERT INTO productos (nombre, descripcion, codigo_barras, precio, stock_actual, stock_minimo, categoria, ubicacion, proveedor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, codigo_barras, precio, stock_actual || 0, stock_minimo || 10, categoria, ubicacion, proveedor],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'El código de barras ya existe' });
        }
        return res.status(500).json({ error: 'Error al crear producto' });
      }
      res.status(201).json({ id: this.lastID, mensaje: 'Producto creado exitosamente' });
    }
  );
});

// Actualizar producto
router.put('/:id', verificarToken, (req, res) => {
  const {
    nombre,
    descripcion,
    codigo_barras,
    precio,
    stock_actual,
    stock_minimo,
    categoria,
    ubicacion,
    proveedor
  } = req.body;

  db.run(
    `UPDATE productos SET 
     nombre = COALESCE(?, nombre),
     descripcion = COALESCE(?, descripcion),
     codigo_barras = COALESCE(?, codigo_barras),
     precio = COALESCE(?, precio),
     stock_actual = COALESCE(?, stock_actual),
     stock_minimo = COALESCE(?, stock_minimo),
     categoria = COALESCE(?, categoria),
     ubicacion = COALESCE(?, ubicacion),
     proveedor = COALESCE(?, proveedor),
     fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nombre, descripcion, codigo_barras, precio, stock_actual, stock_minimo, categoria, ubicacion, proveedor, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'El código de barras ya existe' });
        }
        return res.status(500).json({ error: 'Error al actualizar producto' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ mensaje: 'Producto actualizado exitosamente' });
    }
  );
});

// Eliminar producto
router.delete('/:id', verificarToken, (req, res) => {
  db.run('DELETE FROM productos WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  });
});

// Obtener productos con stock bajo
router.get('/alertas/stock-bajo', verificarToken, (req, res) => {
  db.all(
    'SELECT * FROM productos WHERE stock_actual <= stock_minimo ORDER BY stock_actual ASC',
    [],
    (err, productos) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener alertas de stock' });
      }
      res.json(productos);
    }
  );
});

// Obtener categorías únicas
router.get('/meta/categorias', verificarToken, (req, res) => {
  db.all('SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL ORDER BY categoria', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
    const categorias = rows.map(row => row.categoria);
    res.json(categorias);
  });
});

module.exports = router;
