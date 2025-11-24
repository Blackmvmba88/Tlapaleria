// Servidor principal de la aplicación de Tlapalería
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const db = require('./config/database');
const swaggerSpec = require('./config/swagger');
const { 
  helmetConfig, 
  generalLimiter, 
  sanitizeInput, 
  securityLogger 
} = require('./middleware/security');

// Importar rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const mensajesRoutes = require('./routes/mensajes');
const encuestasRoutes = require('./routes/encuestas');
const comprasRoutes = require('./routes/compras');
const metricsRoutes = require('./routes/metrics');
const backupRoutes = require('./routes/backup');
const inventarioRoutes = require('./routes/inventario');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware de seguridad
app.use(helmetConfig);
app.use(securityLogger);
app.use(generalLimiter);

// Middleware básico
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'tlapaleria-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Documentación de API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Tlapalería API Documentation'
}));

// Ruta para obtener spec en JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica el estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/encuestas', encuestasRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/inventario', inventarioRoutes);

// Socket.IO para mensajería en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a una sala personal (basada en el ID del usuario)
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Usuario ${userId} se unió a su sala`);
  });

  // Enviar mensaje
  socket.on('send_message', (data) => {
    const { destinatarioId, mensaje } = data;
    io.to(`user_${destinatarioId}`).emit('new_message', mensaje);
  });

  // Notificar stock bajo
  socket.on('low_stock_alert', (data) => {
    io.emit('stock_alert', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, io };
