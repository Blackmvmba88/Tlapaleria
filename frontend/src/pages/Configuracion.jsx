// Página de configuración y backup
import { useState } from 'react';
import Layout from '../components/Layout';
import { backupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Configuracion() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const crearBackup = async () => {
    setLoading(true);
    setMensaje('');
    try {
      const response = await backupAPI.backupCompleto();
      setMensaje(`✅ Backup creado exitosamente: ${response.data.nombre}`);
    } catch (error) {
      setMensaje(`❌ Error: ${error.response?.data?.error || 'Error al crear backup'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1>⚙️ Configuración</h1>
        
        <div className="config-section">
          <h2>💾 Backup de Base de Datos</h2>
          <p>Crea una copia de seguridad y súbela automáticamente a Google Drive</p>
          
          {isAdmin ? (
            <>
              <button
                className="btn btn-primary"
                onClick={crearBackup}
                disabled={loading}
              >
                {loading ? 'Creando backup...' : '📤 Crear y Subir Backup'}
              </button>
              {mensaje && (
                <div className={`alert ${mensaje.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                  {mensaje}
                </div>
              )}
            </>
          ) : (
            <p className="alert alert-warning">
              Solo los administradores pueden crear backups
            </p>
          )}
        </div>

        <div className="config-section">
          <h2>ℹ️ Información del Sistema</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Versión:</strong>
              <span>1.0.0</span>
            </div>
            <div className="info-item">
              <strong>Tipo:</strong>
              <span>Open Source</span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>📖 Documentación</h2>
          <p>Para más información, consulta el README del repositorio</p>
          <a
            href="https://github.com/Blackmvmba88/Tlapaleria"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Ver en GitHub
          </a>
        </div>
      </div>
    </Layout>
  );
}

export default Configuracion;
