// Servicio de API para comunicación con el backend
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del backend - configurar según el entorno
// IMPORTANTE: Cambiar estas URLs por las de tu servidor en producción
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Desarrollo local - cambiar localhost por IP local si usas dispositivo físico
  : process.env.API_URL || 'http://localhost:3000/api';  // Producción - usar variable de entorno

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },
  
  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
};

// Servicios de productos
export const productosService = {
  listar: async (params = {}) => {
    const response = await api.get('/productos', { params });
    return response.data;
  },
  
  obtener: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },
  
  crear: async (producto) => {
    const response = await api.post('/productos', producto);
    return response.data;
  },
  
  actualizar: async (id, producto) => {
    const response = await api.put(`/productos/${id}`, producto);
    return response.data;
  },
  
  eliminar: async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },
  
  buscar: async (termino) => {
    const response = await api.get('/productos/buscar', { params: { q: termino } });
    return response.data;
  },
};

// Servicios de ventas
export const ventasService = {
  registrar: async (venta) => {
    const response = await api.post('/ventas', venta);
    return response.data;
  },
  
  listar: async (params = {}) => {
    const response = await api.get('/ventas', { params });
    return response.data;
  },
  
  obtener: async (id) => {
    const response = await api.get(`/ventas/${id}`);
    return response.data;
  },
};

// Servicios de métricas/estadísticas
export const metricsService = {
  dashboard: async () => {
    const response = await api.get('/metrics/dashboard');
    return response.data;
  },
  
  ventasDiarias: async (dias = 30) => {
    const response = await api.get('/metrics/ventas-diarias', { params: { dias } });
    return response.data;
  },
  
  topProductos: async (limit = 10) => {
    const response = await api.get('/metrics/top-productos', { params: { limit } });
    return response.data;
  },
  
  ventasPorCategoria: async () => {
    const response = await api.get('/metrics/ventas-por-categoria');
    return response.data;
  },
};

// Servicios de inventario inteligente
export const inventarioService = {
  alertas: async () => {
    const response = await api.get('/inventario/alertas');
    return response.data;
  },
  
  prediccion: async (productoId, dias = 30) => {
    const response = await api.get(`/inventario/prediccion/${productoId}`, { params: { dias } });
    return response.data;
  },
  
  puntoReorden: async (productoId) => {
    const response = await api.get(`/inventario/punto-reorden/${productoId}`);
    return response.data;
  },
  
  valor: async () => {
    const response = await api.get('/inventario/valor');
    return response.data;
  },
  
  rentables: async (limit = 10) => {
    const response = await api.get('/inventario/rentables', { params: { limit } });
    return response.data;
  },
};

export default api;
