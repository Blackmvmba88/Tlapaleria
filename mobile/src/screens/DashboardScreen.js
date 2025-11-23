// Pantalla de dashboard con métricas principales
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { metricsService } from '../services/api';
import { metricasOfflineService, checkConnection } from '../services/offlineStorage';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = () => {
  const { user } = useAuth();
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const cargarMetricas = async () => {
    try {
      const online = await checkConnection();
      setIsOnline(online);

      if (online) {
        // Cargar desde API
        const data = await metricsService.dashboard();
        setMetricas(data);
        // Guardar en caché
        await metricasOfflineService.guardarCache('dashboard', data);
      } else {
        // Cargar desde caché
        const cachedData = await metricasOfflineService.obtenerCache('dashboard');
        if (cachedData) {
          setMetricas(cachedData);
        } else {
          Alert.alert(
            'Sin conexión',
            'No hay datos en caché. Conecta a internet para cargar las métricas.'
          );
        }
      }
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      Alert.alert('Error', 'No se pudieron cargar las métricas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarMetricas();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando métricas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Modo sin conexión</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.greeting}>
          ¡Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}! 👋
        </Text>
        <Text style={styles.subtitle}>
          {user?.rol === 'admin' ? 'Administrador' : 'Empleado'}
        </Text>
      </View>

      {metricas && (
        <View style={styles.metricsContainer}>
          {/* Total de Ventas */}
          <View style={[styles.metricCard, styles.primaryCard]}>
            <Text style={styles.metricLabel}>Ventas Totales</Text>
            <Text style={styles.metricValue}>
              ${metricas.total_ventas?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.metricSubtext}>
              {metricas.numero_transacciones || 0} transacciones
            </Text>
          </View>

          {/* Productos en Stock */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>📦 Productos en Stock</Text>
            <Text style={styles.metricValue}>
              {metricas.total_productos || 0}
            </Text>
            <Text style={styles.metricSubtext}>
              Valor: ${metricas.valor_inventario?.toFixed(2) || '0.00'}
            </Text>
          </View>

          {/* Alertas de Stock Bajo */}
          <View style={[styles.metricCard, styles.warningCard]}>
            <Text style={styles.metricLabel}>⚠️ Stock Bajo</Text>
            <Text style={styles.metricValue}>
              {metricas.productos_stock_bajo || 0}
            </Text>
            <Text style={styles.metricSubtext}>Productos requieren reorden</Text>
          </View>

          {/* Promedio de Ventas */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>📊 Promedio de Ventas</Text>
            <Text style={styles.metricValue}>
              ${metricas.media_ventas?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.metricSubtext}>Por transacción</Text>
          </View>

          {/* Producto Más Vendido */}
          {metricas.producto_mas_vendido && (
            <View style={[styles.metricCard, styles.fullWidth]}>
              <Text style={styles.metricLabel}>🏆 Producto Más Vendido</Text>
              <Text style={styles.metricValue}>
                {metricas.producto_mas_vendido.nombre}
              </Text>
              <Text style={styles.metricSubtext}>
                {metricas.producto_mas_vendido.total_vendido} unidades vendidas
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Última actualización: {new Date().toLocaleString('es-MX')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#FFA500',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#7C3AED',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
  },
  metricsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  primaryCard: {
    backgroundColor: '#7C3AED',
  },
  warningCard: {
    backgroundColor: '#FFA500',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});

// Aplicar estilos especiales para cards con fondo de color
styles.primaryCard.metricLabel = { ...styles.metricLabel, color: '#e9d5ff' };
styles.primaryCard.metricValue = { ...styles.metricValue, color: '#fff' };
styles.primaryCard.metricSubtext = { ...styles.metricSubtext, color: '#e9d5ff' };
styles.warningCard.metricLabel = { ...styles.metricLabel, color: '#fff' };
styles.warningCard.metricValue = { ...styles.metricValue, color: '#fff' };
styles.warningCard.metricSubtext = { ...styles.metricSubtext, color: '#fff' };

export default DashboardScreen;
