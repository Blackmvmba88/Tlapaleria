// Página para escaneo de códigos de barras con cámara
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Layout from '../components/Layout';
import { productosAPI } from '../services/api';
import './Scanner.css';

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Inicializar el escáner cuando se monta el componente
    if (scanning) {
      iniciarEscaner();
    }
    
    return () => {
      // Limpiar escáner al desmontar
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning]);

  const iniciarEscaner = () => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [0, 1, 2] // Soportar códigos de barras y QR
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    setScanner(html5QrcodeScanner);
  };

  const onScanSuccess = async (codigoEscaneado) => {
    console.log('Código escaneado:', codigoEscaneado);
    
    try {
      // Buscar producto por código de barras
      const response = await productosAPI.getByBarcode(codigoEscaneado);
      setProducto(response.data);
      setError('');
      
      // Detener escáner
      if (scanner) {
        scanner.clear();
      }
      setScanning(false);
    } catch (error) {
      console.error('Error al buscar producto:', error);
      if (error.response?.status === 404) {
        setError('Producto no encontrado. ¿Deseas agregarlo al inventario?');
      } else {
        setError('Error al buscar producto');
      }
    }
  };

  const onScanFailure = (error) => {
    // No hacer nada en caso de error de escaneo (muy común)
    // console.warn('Error de escaneo:', error);
  };

  const detenerEscaner = () => {
    if (scanner) {
      scanner.clear();
    }
    setScanning(false);
  };

  const reiniciarEscaner = () => {
    setProducto(null);
    setError('');
    setScanning(true);
  };

  return (
    <Layout>
      <div className="scanner-page">
        <h1>📷 Escanear Código de Barras</h1>
        <p className="subtitle">Usa la cámara para escanear códigos de barras de productos</p>

        <div className="scanner-container">
          {!scanning && !producto && (
            <div className="scanner-start">
              <button className="btn btn-primary btn-large" onClick={() => setScanning(true)}>
                🎥 Iniciar Escáner
              </button>
              <p>Asegúrate de permitir el acceso a la cámara</p>
            </div>
          )}

          {scanning && (
            <div className="scanner-active">
              <div id="reader"></div>
              <button className="btn btn-secondary" onClick={detenerEscaner}>
                Detener Escáner
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-warning">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={reiniciarEscaner}>
                Intentar de Nuevo
              </button>
            </div>
          )}

          {producto && (
            <div className="producto-resultado">
              <h2>✅ Producto Encontrado</h2>
              <div className="producto-detalles">
                <div className="detalle-row">
                  <span className="label">Nombre:</span>
                  <span className="value">{producto.nombre}</span>
                </div>
                <div className="detalle-row">
                  <span className="label">Código de Barras:</span>
                  <span className="value">{producto.codigo_barras}</span>
                </div>
                <div className="detalle-row">
                  <span className="label">Precio:</span>
                  <span className="value">${producto.precio}</span>
                </div>
                <div className="detalle-row">
                  <span className="label">Stock Actual:</span>
                  <span className={`value ${producto.stock_actual <= producto.stock_minimo ? 'text-danger' : ''}`}>
                    {producto.stock_actual}
                  </span>
                </div>
                {producto.stock_actual <= producto.stock_minimo && (
                  <div className="alert alert-danger">
                    ⚠️ Stock bajo - Necesita reposición
                  </div>
                )}
                {producto.descripcion && (
                  <div className="detalle-row">
                    <span className="label">Descripción:</span>
                    <span className="value">{producto.descripcion}</span>
                  </div>
                )}
                {producto.categoria && (
                  <div className="detalle-row">
                    <span className="label">Categoría:</span>
                    <span className="value">{producto.categoria}</span>
                  </div>
                )}
                {producto.ubicacion && (
                  <div className="detalle-row">
                    <span className="label">Ubicación:</span>
                    <span className="value">{producto.ubicacion}</span>
                  </div>
                )}
              </div>
              <div className="acciones">
                <button className="btn btn-primary" onClick={reiniciarEscaner}>
                  Escanear Otro Producto
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="instrucciones">
          <h3>📖 Instrucciones</h3>
          <ul>
            <li>Presiona "Iniciar Escáner" para activar la cámara</li>
            <li>Permite el acceso a la cámara cuando el navegador lo solicite</li>
            <li>Coloca el código de barras dentro del cuadro de escaneo</li>
            <li>El sistema buscará automáticamente el producto</li>
            <li>Si el producto no existe, podrás agregarlo al inventario</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default Scanner;
