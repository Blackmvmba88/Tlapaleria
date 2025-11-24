// Middleware de seguridad mejorado
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configurar Helmet para seguridad HTTP
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiter general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos de inicio de sesión
  skipSuccessfulRequests: true,
  message: {
    error: 'Demasiados intentos de inicio de sesión, por favor intenta más tarde.'
  }
});

// Rate limiter para creación de recursos
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 creaciones por minuto
  message: {
    error: 'Demasiadas creaciones, por favor espera un momento.'
  }
});

// Middleware para validar entrada de datos
const sanitizeInput = (req, res, next) => {
  // Sanitizar strings en body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Eliminar caracteres potencialmente peligrosos
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '') // Eliminar < y >
          .trim();
      }
    });
  }
  next();
};

// Middleware para logging de seguridad
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log de solicitudes sospechosas
  const suspiciousPatterns = [
    /(\.\.)|(\/\/)/,  // Path traversal
    /<script>/i,       // XSS
    /union.*select/i,  // SQL injection
    /javascript:/i     // XSS en URLs
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || 
    (req.body && JSON.stringify(req.body).match(pattern))
  );
  
  if (isSuspicious) {
    console.warn(`[SEGURIDAD] Solicitud sospechosa detectada: ${timestamp} ${method} ${url} desde ${ip}`);
  }
  
  next();
};

// Middleware para CORS seguro
const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 horas
};

module.exports = {
  helmetConfig,
  generalLimiter,
  authLimiter,
  createLimiter,
  sanitizeInput,
  securityLogger,
  corsConfig
};
