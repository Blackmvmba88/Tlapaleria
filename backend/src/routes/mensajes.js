// Rutas para sistema de mensajería entre trabajadores
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener mensajes del usuario (recibidos y enviados)
router.get('/', verificarToken, (req, res) => {
  const usuario_id = req.usuario.id;
  const { conversacion_con } = req.query;

  let query = `
    SELECT m.*, 
           u_remitente.nombre as remitente_nombre,
           u_remitente.foto as remitente_foto,
           u_destinatario.nombre as destinatario_nombre,
           u_destinatario.foto as destinatario_foto
    FROM mensajes m
    JOIN usuarios u_remitente ON m.remitente_id = u_remitente.id
    JOIN usuarios u_destinatario ON m.destinatario_id = u_destinatario.id
    WHERE (m.remitente_id = ? OR m.destinatario_id = ?)
  `;
  const params = [usuario_id, usuario_id];

  if (conversacion_con) {
    query += ' AND (m.remitente_id = ? OR m.destinatario_id = ?)';
    params.push(conversacion_con, conversacion_con);
  }

  query += ' ORDER BY m.fecha_envio DESC';

  db.all(query, params, (err, mensajes) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener mensajes' });
    }
    res.json(mensajes);
  });
});

// Enviar mensaje
router.post('/', verificarToken, (req, res) => {
  const remitente_id = req.usuario.id;
  const { destinatario_id, mensaje } = req.body;

  if (!destinatario_id || !mensaje) {
    return res.status(400).json({ error: 'Destinatario y mensaje son requeridos' });
  }

  db.run(
    'INSERT INTO mensajes (remitente_id, destinatario_id, mensaje) VALUES (?, ?, ?)',
    [remitente_id, destinatario_id, mensaje],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar mensaje' });
      }

      // Obtener el mensaje completo con información de usuarios
      db.get(
        `SELECT m.*, 
                u_remitente.nombre as remitente_nombre,
                u_remitente.foto as remitente_foto,
                u_destinatario.nombre as destinatario_nombre,
                u_destinatario.foto as destinatario_foto
         FROM mensajes m
         JOIN usuarios u_remitente ON m.remitente_id = u_remitente.id
         JOIN usuarios u_destinatario ON m.destinatario_id = u_destinatario.id
         WHERE m.id = ?`,
        [this.lastID],
        (err, mensajeCompleto) => {
          if (err) {
            return res.status(500).json({ error: 'Error al obtener mensaje' });
          }
          res.status(201).json(mensajeCompleto);
        }
      );
    }
  );
});

// Marcar mensaje como leído
router.put('/:id/leer', verificarToken, (req, res) => {
  const usuario_id = req.usuario.id;
  const mensaje_id = req.params.id;

  db.run(
    'UPDATE mensajes SET leido = 1 WHERE id = ? AND destinatario_id = ?',
    [mensaje_id, usuario_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al marcar mensaje como leído' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Mensaje no encontrado' });
      }
      res.json({ mensaje: 'Mensaje marcado como leído' });
    }
  );
});

// Obtener conversaciones (lista de usuarios con los que se ha intercambiado mensajes)
router.get('/conversaciones', verificarToken, (req, res) => {
  const usuario_id = req.usuario.id;

  const query = `
    SELECT DISTINCT
      CASE 
        WHEN m.remitente_id = ? THEN m.destinatario_id
        ELSE m.remitente_id
      END as otro_usuario_id,
      u.nombre,
      u.foto,
      (SELECT COUNT(*) FROM mensajes 
       WHERE destinatario_id = ? AND remitente_id = u.id AND leido = 0) as mensajes_no_leidos,
      MAX(m.fecha_envio) as ultima_actividad
    FROM mensajes m
    JOIN usuarios u ON (
      CASE 
        WHEN m.remitente_id = ? THEN m.destinatario_id = u.id
        ELSE m.remitente_id = u.id
      END
    )
    WHERE m.remitente_id = ? OR m.destinatario_id = ?
    GROUP BY otro_usuario_id, u.nombre, u.foto
    ORDER BY ultima_actividad DESC
  `;

  db.all(query, [usuario_id, usuario_id, usuario_id, usuario_id, usuario_id], (err, conversaciones) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener conversaciones' });
    }
    res.json(conversaciones);
  });
});

// Obtener mensajes no leídos
router.get('/no-leidos/count', verificarToken, (req, res) => {
  const usuario_id = req.usuario.id;

  db.get(
    'SELECT COUNT(*) as total FROM mensajes WHERE destinatario_id = ? AND leido = 0',
    [usuario_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al contar mensajes no leídos' });
      }
      res.json({ total: result.total });
    }
  );
});

module.exports = router;
