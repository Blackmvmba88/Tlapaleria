// Página de gestión de inventario
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { productosAPI } from '../services/api';
import './Inventario.css';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ buscar: '', categoria: '', bajo_stock: false });
  const [showModal, setShowModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo_barras: '',
    precio: '',
    stock_actual: '',
    stock_minimo: '10',
    categoria: '',
    ubicacion: '',
    proveedor: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        productosAPI.getAll(filtros),
        productosAPI.getCategorias()
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (productoEditar) {
        await productosAPI.update(productoEditar.id, formData);
      } else {
        await productosAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productosAPI.delete(id);
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  const editarProducto = (producto) => {
    setProductoEditar(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      codigo_barras: producto.codigo_barras || '',
      precio: producto.precio,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      categoria: producto.categoria || '',
      ubicacion: producto.ubicacion || '',
      proveedor: producto.proveedor || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setProductoEditar(null);
    setFormData({
      nombre: '',
      descripcion: '',
      codigo_barras: '',
      precio: '',
      stock_actual: '',
      stock_minimo: '10',
      categoria: '',
      ubicacion: '',
      proveedor: ''
    });
  };

  return (
    <Layout>
      <div className="inventario">
        <div className="page-header">
          <h1>📦 Inventario</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Agregar Producto
          </button>
        </div>

        {/* Filtros */}
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={filtros.buscar}
            onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
            className="search-input"
          />
          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filtros.bajo_stock}
              onChange={(e) => setFiltros({ ...filtros, bajo_stock: e.target.checked })}
            />
            Solo stock bajo
          </label>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="productos-grid">
            {productos.map(producto => (
              <div key={producto.id} className={`producto-card ${producto.stock_actual <= producto.stock_minimo ? 'low-stock' : ''}`}>
                <div className="producto-header">
                  <h3>{producto.nombre}</h3>
                  {producto.stock_actual <= producto.stock_minimo && (
                    <span className="alert-badge">⚠️ Stock Bajo</span>
                  )}
                </div>
                <p className="producto-desc">{producto.descripcion}</p>
                <div className="producto-info">
                  <div className="info-row">
                    <span className="label">Precio:</span>
                    <span className="value">${producto.precio}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Stock:</span>
                    <span className={`value ${producto.stock_actual <= producto.stock_minimo ? 'text-danger' : ''}`}>
                      {producto.stock_actual} / {producto.stock_minimo}
                    </span>
                  </div>
                  {producto.categoria && (
                    <div className="info-row">
                      <span className="label">Categoría:</span>
                      <span className="value">{producto.categoria}</span>
                    </div>
                  )}
                  {producto.codigo_barras && (
                    <div className="info-row">
                      <span className="label">Código:</span>
                      <span className="value">{producto.codigo_barras}</span>
                    </div>
                  )}
                </div>
                <div className="producto-actions">
                  <button className="btn btn-small" onClick={() => editarProducto(producto)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(producto.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de formulario */}
        {showModal && (
          <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Código de Barras</label>
                    <input
                      type="text"
                      value={formData.codigo_barras}
                      onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Precio *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Actual</label>
                    <input
                      type="number"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Mínimo</label>
                    <input
                      type="number"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Proveedor</label>
                    <input
                      type="text"
                      value={formData.proveedor}
                      onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {productoEditar ? 'Actualizar' : 'Crear'}
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

export default Inventario;
