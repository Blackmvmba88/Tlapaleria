// Página de compras futuras
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { comprasAPI } from '../services/api';

function ComprasFuturas() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      const response = await comprasAPI.getAll({});
      setCompras(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoGenerar = async () => {
    try {
      await comprasAPI.autoGenerar();
      cargarCompras();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1>🛒 Compras Futuras</h1>
          <button className="btn btn-primary" onClick={autoGenerar}>
            🤖 Auto-generar
          </button>
        </div>
        
        {loading ? (
          <p>Cargando compras...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              {compras.map(compra => (
                <tr key={compra.id}>
                  <td>{compra.producto_nombre}</td>
                  <td>{compra.cantidad_solicitada}</td>
                  <td>
                    <span className={`badge badge-${compra.prioridad}`}>
                      {compra.prioridad}
                    </span>
                  </td>
                  <td>{compra.estado}</td>
                  <td>{compra.stock_actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default ComprasFuturas;
