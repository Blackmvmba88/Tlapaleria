// Rutas de autenticación con Google OAuth
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login con Google - Verificar y crear/actualizar usuario
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, nombre, foto } = req.body;

    if (!googleId || !email || !nombre) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Buscar o crear usuario
    db.get(
      'SELECT * FROM usuarios WHERE google_id = ? OR email = ?',
      [googleId, email],
      (err, usuario) => {
        if (err) {
          return res.status(500).json({ error: 'Error al buscar usuario' });
        }

        if (usuario) {
          // Usuario existe, actualizar datos
          db.run(
            `UPDATE usuarios SET nombre = ?, foto = ? WHERE id = ?`,
            [nombre, foto, usuario.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Error al actualizar usuario' });
              }
              
              // Generar token
              const token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol },
                process.env.JWT_SECRET || 'tlapaleria-jwt-secret',
                { expiresIn: '24h' }
              );

              res.json({
                token,
                usuario: {
                  id: usuario.id,
                  email: usuario.email,
                  nombre,
                  foto,
                  rol: usuario.rol
                }
              });
            }
          );
        } else {
          // Crear nuevo usuario
          db.run(
            `INSERT INTO usuarios (google_id, email, nombre, foto, rol) VALUES (?, ?, ?, ?, ?)`,
            [googleId, email, nombre, foto, 'trabajador'],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Error al crear usuario' });
              }

              // Generar token
              const token = jwt.sign(
                { id: this.lastID, email, rol: 'trabajador' },
                process.env.JWT_SECRET || 'tlapaleria-jwt-secret',
                { expiresIn: '24h' }
              );

              res.json({
                token,
                usuario: {
                  id: this.lastID,
                  email,
                  nombre,
                  foto,
                  rol: 'trabajador'
                }
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al procesar login' });
  }
});

// Verificar token actual
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tlapaleria-jwt-secret');
    
    db.get('SELECT id, email, nombre, foto, rol FROM usuarios WHERE id = ?', [decoded.id], (err, usuario) => {
      if (err || !usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({ usuario });
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Obtener lista de usuarios (solo trabajadores para mensajería)
router.get('/usuarios', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'tlapaleria-jwt-secret');
    
    db.all('SELECT id, nombre, email, foto, rol FROM usuarios', [], (err, usuarios) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener usuarios' });
      }
      res.json(usuarios);
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
