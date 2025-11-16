// Rutas para encuestas de clientes
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todas las encuestas
router.get('/', (req, res) => {
  const { activa } = req.query;
  
  let query = 'SELECT * FROM encuestas';
  const params = [];

  if (activa !== undefined) {
    query += ' WHERE activa = ?';
    params.push(activa === 'true' ? 1 : 0);
  }

  query += ' ORDER BY fecha_creacion DESC';

  db.all(query, params, (err, encuestas) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener encuestas' });
    }
    res.json(encuestas);
  });
});

// Obtener encuesta por ID con sus respuestas
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM encuestas WHERE id = ?', [req.params.id], (err, encuesta) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener encuesta' });
    }
    if (!encuesta) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    // Obtener respuestas de la encuesta
    db.all(
      'SELECT * FROM respuestas_encuesta WHERE encuesta_id = ? ORDER BY fecha_respuesta DESC',
      [req.params.id],
      (err, respuestas) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener respuestas' });
        }
        res.json({ ...encuesta, respuestas });
      }
    );
  });
});

// Crear nueva encuesta (solo usuarios autenticados)
router.post('/', verificarToken, (req, res) => {
  const { titulo, descripcion } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'El título es requerido' });
  }

  db.run(
    'INSERT INTO encuestas (titulo, descripcion) VALUES (?, ?)',
    [titulo, descripcion],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear encuesta' });
      }
      res.status(201).json({
        id: this.lastID,
        mensaje: 'Encuesta creada exitosamente'
      });
    }
  );
});

// Responder encuesta (público, no requiere autenticación)
router.post('/:id/responder', (req, res) => {
  const encuesta_id = req.params.id;
  const { pregunta, respuesta, calificacion } = req.body;

  if (!pregunta || !respuesta) {
    return res.status(400).json({ error: 'Pregunta y respuesta son requeridas' });
  }

  // Verificar que la encuesta existe y está activa
  db.get('SELECT * FROM encuestas WHERE id = ? AND activa = 1', [encuesta_id], (err, encuesta) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar encuesta' });
    }
    if (!encuesta) {
      return res.status(404).json({ error: 'Encuesta no encontrada o inactiva' });
    }

    db.run(
      'INSERT INTO respuestas_encuesta (encuesta_id, pregunta, respuesta, calificacion) VALUES (?, ?, ?, ?)',
      [encuesta_id, pregunta, respuesta, calificacion],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al guardar respuesta' });
        }
        res.status(201).json({
          id: this.lastID,
          mensaje: 'Respuesta guardada exitosamente'
        });
      }
    );
  });
});

// Actualizar estado de encuesta
router.put('/:id', verificarToken, (req, res) => {
  const { activa } = req.body;

  if (activa === undefined) {
    return res.status(400).json({ error: 'El estado es requerido' });
  }

  db.run(
    'UPDATE encuestas SET activa = ? WHERE id = ?',
    [activa ? 1 : 0, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar encuesta' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
      }
      res.json({ mensaje: 'Encuesta actualizada exitosamente' });
    }
  );
});

// Obtener estadísticas de una encuesta
router.get('/:id/estadisticas', verificarToken, (req, res) => {
  const encuesta_id = req.params.id;

  const queries = {
    total_respuestas: 'SELECT COUNT(*) as total FROM respuestas_encuesta WHERE encuesta_id = ?',
    calificacion_promedio: 'SELECT AVG(calificacion) as promedio FROM respuestas_encuesta WHERE encuesta_id = ? AND calificacion IS NOT NULL',
    respuestas_por_calificacion: 'SELECT calificacion, COUNT(*) as total FROM respuestas_encuesta WHERE encuesta_id = ? AND calificacion IS NOT NULL GROUP BY calificacion'
  };

  const resultados = {};

  // Obtener total de respuestas
  db.get(queries.total_respuestas, [encuesta_id], (err, total) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
    resultados.total_respuestas = total.total;

    // Obtener calificación promedio
    db.get(queries.calificacion_promedio, [encuesta_id], (err, promedio) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      resultados.calificacion_promedio = promedio.promedio ? promedio.promedio.toFixed(2) : null;

      // Obtener distribución de calificaciones
      db.all(queries.respuestas_por_calificacion, [encuesta_id], (err, distribucion) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
        resultados.distribucion_calificaciones = distribucion;
        res.json(resultados);
      });
    });
  });
});

module.exports = router;
