// Servicio de API para comunicación con el backend
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con token de autenticación
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Autenticación
export const authAPI = {
  loginGoogle: (userData) => api.post('/auth/google', userData),
  verify: () => api.get('/auth/verify'),
  getUsuarios: () => api.get('/auth/usuarios'),
};

// Productos
export const productosAPI = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  getByBarcode: (codigo) => api.get(`/productos/barcode/${codigo}`),
  create: (producto) => api.post('/productos', producto),
  update: (id, producto) => api.put(`/productos/${id}`, producto),
  delete: (id) => api.delete(`/productos/${id}`),
  getStockBajo: () => api.get('/productos/alertas/stock-bajo'),
  getCategorias: () => api.get('/productos/meta/categorias'),
};

// Ventas
export const ventasAPI = {
  getAll: (params) => api.get('/ventas', { params }),
  getById: (id) => api.get(`/ventas/${id}`),
  create: (venta) => api.post('/ventas', venta),
};

// Mensajes
export const mensajesAPI = {
  getAll: (params) => api.get('/mensajes', { params }),
  send: (mensaje) => api.post('/mensajes', mensaje),
  markAsRead: (id) => api.put(`/mensajes/${id}/leer`),
  getConversaciones: () => api.get('/mensajes/conversaciones'),
  getUnreadCount: () => api.get('/mensajes/no-leidos/count'),
};

// Métricas
export const metricsAPI = {
  getGeneral: (params) => api.get('/metrics/general', { params }),
  getTopProductos: (params) => api.get('/metrics/top-productos', { params }),
  getVentasPorDia: (params) => api.get('/metrics/ventas-por-dia', { params }),
  getVentasPorCategoria: (params) => api.get('/metrics/ventas-por-categoria', { params }),
  getInventarioResumen: () => api.get('/metrics/inventario-resumen'),
  getUsuariosStats: () => api.get('/metrics/usuarios-stats'),
};

// Encuestas
export const encuestasAPI = {
  getAll: (params) => api.get('/encuestas', { params }),
  getById: (id) => api.get(`/encuestas/${id}`),
  create: (encuesta) => api.post('/encuestas', encuesta),
  responder: (id, respuesta) => api.post(`/encuestas/${id}/responder`, respuesta),
  update: (id, data) => api.put(`/encuestas/${id}`, data),
  getEstadisticas: (id) => api.get(`/encuestas/${id}/estadisticas`),
};

// Compras futuras
export const comprasAPI = {
  getAll: (params) => api.get('/compras', { params }),
  create: (compra) => api.post('/compras', compra),
  update: (id, data) => api.put(`/compras/${id}`, data),
  delete: (id) => api.delete(`/compras/${id}`),
  autoGenerar: () => api.post('/compras/auto-generar'),
};

// Backup
export const backupAPI = {
  crear: () => api.post('/backup/crear'),
  subirDrive: (archivo) => api.post('/backup/subir-drive', { archivo }),
  backupCompleto: () => api.post('/backup/backup-completo'),
  getLista: () => api.get('/backup/lista'),
  getListaDrive: () => api.get('/backup/lista-drive'),
};

export default api;
