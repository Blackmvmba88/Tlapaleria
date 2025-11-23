// Configuración de Swagger para documentación de API
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tlapalería API',
      version: '1.0.0',
      description: 'API completa para gestión de tlapalería/ferretería con Node.js, Express y SQLite',
      contact: {
        name: 'Jesús Morán',
        url: 'https://github.com/Blackmvmba88/Tlapaleria'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.tlapaleria.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            rol: { type: 'string', enum: ['trabajador', 'admin'], example: 'trabajador' },
            foto: { type: 'string', example: 'https://ejemplo.com/foto.jpg' }
          }
        },
        Producto: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Martillo' },
            descripcion: { type: 'string', example: 'Martillo de acero de 16 oz' },
            codigo_barras: { type: 'string', example: '1234567890123' },
            precio: { type: 'number', format: 'float', example: 150.50 },
            stock_actual: { type: 'integer', example: 25 },
            stock_minimo: { type: 'integer', example: 10 },
            categoria: { type: 'string', example: 'Herramientas' },
            ubicacion: { type: 'string', example: 'Pasillo A, Estante 3' },
            proveedor: { type: 'string', example: 'Proveedores SA' }
          }
        },
        Venta: {
          type: 'object',
          required: ['producto_id', 'cantidad'],
          properties: {
            id: { type: 'integer', example: 1 },
            producto_id: { type: 'integer', example: 1 },
            usuario_id: { type: 'integer', example: 1 },
            cantidad: { type: 'integer', example: 2 },
            precio_unitario: { type: 'number', format: 'float', example: 150.50 },
            total: { type: 'number', format: 'float', example: 301.00 },
            fecha_venta: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensaje de error' },
            message: { type: 'string', example: 'Descripción detallada del error' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
