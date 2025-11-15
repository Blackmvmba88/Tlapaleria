// Dashboard principal con métricas (Panel de Jesús Morán)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { metricsAPI, productosAPI } from '../services/api';
import './Dashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metricsGenerales, setMetricsGenerales] = useState(null);
  const [topProductos, setTopProductos] = useState([]);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [inventarioResumen, setInventarioResumen] = useState(null);
  const [productosStockBajo, setProductosStockBajo] = useState([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar todas las métricas en paralelo
      const [
        metricsRes,
        topRes,
        ventasDiaRes,
        ventasCatRes,
        inventarioRes,
        stockBajoRes,
      ] = await Promise.all([
        metricsAPI.getGeneral(),
        metricsAPI.getTopProductos({ limite: 10 }),
        metricsAPI.getVentasPorDia({ dias: 30 }),
        metricsAPI.getVentasPorCategoria(),
        metricsAPI.getInventarioResumen(),
        productosAPI.getStockBajo(),
      ]);

      setMetricsGenerales(metricsRes.data);
      setTopProductos(topRes.data);
      setVentasPorDia(ventasDiaRes.data);
      setVentasPorCategoria(ventasCatRes.data);
      setInventarioResumen(inventarioRes.data);
      setProductosStockBajo(stockBajoRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuración de gráfica de ventas por día (línea)
  const ventasPorDiaChart = {
    labels: ventasPorDia.map(v => {
      const fecha = new Date(v.fecha);
      return fecha.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Ventas ($)',
        data: ventasPorDia.map(v => v.total_ventas),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Configuración de gráfica de top productos (barras)
  const topProductosChart = {
    labels: topProductos.slice(0, 5).map(p => p.nombre),
    datasets: [
      {
        label: 'Unidades vendidas',
        data: topProductos.slice(0, 5).map(p => p.total_vendido),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  // Configuración de gráfica de ventas por categoría (pie)
  const ventasPorCategoriaChart = {
    labels: ventasPorCategoria.map(c => c.categoria),
    datasets: [
      {
        label: 'Ventas por categoría',
        data: ventasPorCategoria.map(c => c.total_ventas),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Cargando dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>📊 Dashboard - Panel de Control</h1>
        <p className="subtitle">Métricas y estadísticas generales</p>

        {/* Tarjetas de resumen */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>💰 Total de Ventas</h3>
            <p className="metric-value">${metricsGenerales?.total_ventas || 0}</p>
            <p className="metric-label">En el período</p>
          </div>

          <div className="metric-card">
            <h3>📈 Media de Ventas</h3>
            <p className="metric-value">${metricsGenerales?.media_ventas || 0}</p>
            <p className="metric-label">Promedio por venta</p>
          </div>

          <div className="metric-card">
            <h3>🏆 Producto Más Vendido</h3>
            <p className="metric-value">
              {metricsGenerales?.producto_mas_vendido?.nombre || 'N/A'}
            </p>
            <p className="metric-label">
              {metricsGenerales?.producto_mas_vendido?.cantidad_vendida || 0} unidades
            </p>
          </div>

          <div className="metric-card">
            <h3>📦 Total de Ventas</h3>
            <p className="metric-value">{metricsGenerales?.numero_ventas || 0}</p>
            <p className="metric-label">Transacciones realizadas</p>
          </div>
        </div>

        {/* Tarjetas de inventario */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>📦 Total Productos</h3>
            <p className="metric-value">{inventarioResumen?.total_productos || 0}</p>
            <p className="metric-label">En inventario</p>
          </div>

          <div className="metric-card">
            <h3>💵 Valor Inventario</h3>
            <p className="metric-value">${inventarioResumen?.valor_inventario?.toFixed(2) || 0}</p>
            <p className="metric-label">Valor total</p>
          </div>

          <div className="metric-card warning">
            <h3>⚠️ Stock Bajo</h3>
            <p className="metric-value">{inventarioResumen?.productos_bajo_stock || 0}</p>
            <p className="metric-label">Productos por reponer</p>
          </div>

          <div className="metric-card danger">
            <h3>🚫 Sin Stock</h3>
            <p className="metric-value">{inventarioResumen?.productos_sin_stock || 0}</p>
            <p className="metric-label">Productos agotados</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="charts-grid">
          <div className="chart-card">
            <h2>📈 Ventas de los Últimos 30 Días</h2>
            {ventasPorDia.length > 0 ? (
              <Line data={ventasPorDiaChart} options={{ responsive: true, maintainAspectRatio: true }} />
            ) : (
              <p>No hay datos de ventas</p>
            )}
          </div>

          <div className="chart-card">
            <h2>🏆 Top 5 Productos Más Vendidos</h2>
            {topProductos.length > 0 ? (
              <Bar data={topProductosChart} options={{ responsive: true, maintainAspectRatio: true }} />
            ) : (
              <p>No hay datos de productos</p>
            )}
          </div>
        </div>

        {ventasPorCategoria.length > 0 && (
          <div className="chart-card-full">
            <h2>🎯 Ventas por Categoría</h2>
            <div className="pie-chart-container">
              <Pie data={ventasPorCategoriaChart} options={{ responsive: true }} />
            </div>
          </div>
        )}

        {/* Alertas de stock bajo */}
        {productosStockBajo.length > 0 && (
          <div className="stock-alerts">
            <h2>⚠️ Alertas de Stock Bajo</h2>
            <div className="alerts-list">
              {productosStockBajo.slice(0, 5).map(producto => (
                <div key={producto.id} className="alert-item">
                  <div className="alert-info">
                    <strong>{producto.nombre}</strong>
                    <span>Stock: {producto.stock_actual} / Mínimo: {producto.stock_minimo}</span>
                  </div>
                  <button
                    className="btn btn-small"
                    onClick={() => navigate(`/inventario`)}
                  >
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
            {productosStockBajo.length > 5 && (
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/compras')}
              >
                Ver todas las alertas ({productosStockBajo.length})
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
