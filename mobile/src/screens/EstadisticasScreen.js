// Pantalla de estadísticas con gráficas
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { metricsService } from '../services/api';
import { metricasOfflineService, checkConnection } from '../services/offlineStorage';

const EstadisticasScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);

  const cargarDatos = async () => {
    try {
      const online = await checkConnection();
      setIsOnline(online);

      if (online) {
        // Cargar desde API
        const [diarias, top, categorias] = await Promise.all([
          metricsService.ventasDiarias(30),
          metricsService.topProductos(5),
          metricsService.ventasPorCategoria(),
        ]);

        setVentasDiarias(diarias);
        setTopProductos(top);
        setVentasPorCategoria(categorias);

        // Guardar en caché
        await metricasOfflineService.guardarCache('ventas_diarias', diarias);
        await metricasOfflineService.guardarCache('top_productos', top);
        await metricasOfflineService.guardarCache('ventas_categoria', categorias);
      } else {
        // Cargar desde caché
        const [diarias, top, categorias] = await Promise.all([
          metricasOfflineService.obtenerCache('ventas_diarias'),
          metricasOfflineService.obtenerCache('top_productos'),
          metricasOfflineService.obtenerCache('ventas_categoria'),
        ]);

        if (diarias && top && categorias) {
          setVentasDiarias(diarias);
          setTopProductos(top);
          setVentasPorCategoria(categorias);
        } else {
          Alert.alert(
            'Sin datos',
            'No hay estadísticas en caché. Conecta a internet para cargar los datos.'
          );
        }
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#7C3AED',
    },
  };

  // Preparar datos para gráficas
  const lineChartData = {
    labels: ventasDiarias.slice(-7).map((v) => {
      const date = new Date(v.fecha);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: ventasDiarias.slice(-7).map((v) => v.total),
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: topProductos.map((p) => p.nombre.substring(0, 10)),
    datasets: [
      {
        data: topProductos.map((p) => p.total_vendido),
      },
    ],
  };

  const pieChartData = ventasPorCategoria.map((cat, index) => ({
    name: cat.categoria || 'Sin categoría',
    population: cat.total_ventas,
    color: [
      '#7C3AED',
      '#FFA500',
      '#10B981',
      '#EF4444',
      '#3B82F6',
      '#F59E0B',
    ][index % 6],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

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

      <View style={styles.content}>
        <Text style={styles.title}>📊 Estadísticas</Text>

        {/* Ventas de los últimos 7 días */}
        {ventasDiarias.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Ventas Últimos 7 Días</Text>
            <LineChart
              data={lineChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Top 5 Productos */}
        {topProductos.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Top 5 Productos Más Vendidos</Text>
            <BarChart
              data={barChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
        )}

        {/* Ventas por Categoría */}
        {ventasPorCategoria.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Ventas por Categoría</Text>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Resumen de Top Productos */}
        {topProductos.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Detalle de Productos Top</Text>
            {topProductos.map((producto, index) => (
              <View key={producto.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemRank}>#{index + 1}</Text>
                  <View>
                    <Text style={styles.listItemName}>{producto.nombre}</Text>
                    <Text style={styles.listItemInfo}>
                      {producto.total_vendido} unidades vendidas
                    </Text>
                  </View>
                </View>
                <Text style={styles.listItemValue}>
                  ${producto.ingresos_totales?.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginRight: 15,
    width: 30,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listItemInfo: {
    fontSize: 12,
    color: '#666',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
});

export default EstadisticasScreen;
