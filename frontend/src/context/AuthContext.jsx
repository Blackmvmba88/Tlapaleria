// Context para autenticación global
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    verificarToken();
  }, []);

  const verificarToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verify();
      setUsuario(response.data.usuario);
    } catch (error) {
      console.error('Error al verificar token:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (googleData) => {
    try {
      const response = await authAPI.loginGoogle(googleData);
      localStorage.setItem('token', response.data.token);
      setUsuario(response.data.usuario);
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  const value = {
    usuario,
    loading,
    login,
    logout,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
