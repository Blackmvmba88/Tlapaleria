// Página de gestión de ventas
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ventasAPI, productosAPI } from '../services/api';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    producto_id: '',
    cantidad: '1',
    precio_unitario: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [ventasRes, productosRes] = await Promise.all([
        ventasAPI.getAll(),
        productosAPI.getAll({})
      ]);
      setVentas(ventasRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ventasAPI.create(formData);
      setShowModal(false);
      setFormData({ producto_id: '', cantidad: '1', precio_unitario: '' });
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al registrar venta');
    }
  };

  const handleProductoChange = (e) => {
    const productoId = e.target.value;
    const producto = productos.find(p => p.id === parseInt(productoId));
    setFormData({
      ...formData,
      producto_id: productoId,
      precio_unitario: producto ? producto.precio : ''
    });
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1>💰 Ventas</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Registrar Venta
          </button>
        </div>

        {loading ? (
          <p>Cargando ventas...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(venta => (
                <tr key={venta.id}>
                  <td>{new Date(venta.fecha_venta).toLocaleString('es-MX')}</td>
                  <td>{venta.producto_nombre}</td>
                  <td>{venta.cantidad}</td>
                  <td>${venta.precio_unitario}</td>
                  <td>${venta.total}</td>
                  <td>{venta.vendedor_nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Registrar Venta</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Producto *</label>
                  <select
                    required
                    value={formData.producto_id}
                    onChange={handleProductoChange}
                  >
                    <option value="">Seleccionar...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (Stock: {p.stock_actual})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Precio Unitario *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Ventas;
