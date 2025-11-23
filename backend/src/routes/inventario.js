// Rutas para inventario inteligente
const express = require('express');
const router = express.Router();
const InventarioInteligenteService = require('../services/inventarioInteligente');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/inventario/prediccion/{id}:
 *   get:
 *     summary: Predice la demanda futura de un producto
 *     tags: [Inventario Inteligente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días hacia atrás para analizar
 *     responses:
 *       200:
 *         description: Predicción de demanda calculada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/prediccion/:id', verificarToken, async (req, res) => {
  try {
    const productoId = parseInt(req.params.id);
    const dias = parseInt(req.query.dias) || 30;
    
    const prediccion = await InventarioInteligenteService.predecirDemanda(productoId, dias);
    res.json(prediccion);
  } catch (error) {
    console.error('Error al predecir demanda:', error);
    res.status(500).json({ error: 'Error al predecir demanda', message: error.message });
  }
});

/**
 * @swagger
 * /api/inventario/punto-reorden/{id}:
 *   get:
 *     summary: Calcula el punto de reorden óptimo para un producto
 *     tags: [Inventario Inteligente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Punto de reorden calculado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/punto-reorden/:id', verificarToken, async (req, res) => {
  try {
    const productoId = parseInt(req.params.id);
    const reorden = await InventarioInteligenteService.calcularPuntoReorden(productoId);
    res.json(reorden);
  } catch (error) {
    console.error('Error al calcular punto de reorden:', error);
    if (error.message === 'Producto no encontrado') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al calcular punto de reorden', message: error.message });
    }
  }
});

/**
 * @swagger
 * /api/inventario/alertas:
 *   get:
 *     summary: Obtiene todas las alertas de stock bajo con información de reorden
 *     tags: [Inventario Inteligente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas generada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/alertas', verificarToken, async (req, res) => {
  try {
    const alertas = await InventarioInteligenteService.generarAlertas();
    res.json({
      total: alertas.length,
      alertas
    });
  } catch (error) {
    console.error('Error al generar alertas:', error);
    res.status(500).json({ error: 'Error al generar alertas', message: error.message });
  }
});

/**
 * @swagger
 * /api/inventario/lento-movimiento:
 *   get:
 *     summary: Analiza productos de lento movimiento
 *     tags: [Inventario Inteligente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 60
 *         description: Días sin ventas para considerar lento movimiento
 *     responses:
 *       200:
 *         description: Productos de lento movimiento analizados
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/lento-movimiento', verificarToken, async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 60;
    const productos = await InventarioInteligenteService.analizarLentoMovimiento(dias);
    res.json({
      total: productos.length,
      dias_analisis: dias,
      productos
    });
  } catch (error) {
    console.error('Error al analizar lento movimiento:', error);
    res.status(500).json({ error: 'Error al analizar lento movimiento', message: error.message });
  }
});

/**
 * @swagger
 * /api/inventario/valor:
 *   get:
 *     summary: Calcula el valor total del inventario
 *     tags: [Inventario Inteligente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Valor del inventario calculado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/valor', verificarToken, async (req, res) => {
  try {
    const valor = await InventarioInteligenteService.calcularValorInventario();
    res.json(valor);
  } catch (error) {
    console.error('Error al calcular valor de inventario:', error);
    res.status(500).json({ error: 'Error al calcular valor de inventario', message: error.message });
  }
});

/**
 * @swagger
 * /api/inventario/rentables:
 *   get:
 *     summary: Obtiene los productos más rentables
 *     tags: [Inventario Inteligente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de productos a retornar
 *     responses:
 *       200:
 *         description: Productos más rentables
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/rentables', verificarToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const productos = await InventarioInteligenteService.obtenerProductosRentables(limit);
    res.json({
      total: productos.length,
      productos
    });
  } catch (error) {
    console.error('Error al obtener productos rentables:', error);
    res.status(500).json({ error: 'Error al obtener productos rentables', message: error.message });
  }
});

module.exports = router;
