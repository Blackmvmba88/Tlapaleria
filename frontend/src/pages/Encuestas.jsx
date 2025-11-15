// Página de encuestas de clientes
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { encuestasAPI } from '../services/api';

function Encuestas() {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEncuestas();
  }, []);

  const cargarEncuestas = async () => {
    try {
      const response = await encuestasAPI.getAll({});
      setEncuestas(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1>📋 Encuestas de Clientes</h1>
        <p>Sistema de encuestas de satisfacción</p>
        {loading ? (
          <p>Cargando encuestas...</p>
        ) : (
          <div className="encuestas-list">
            {encuestas.map(encuesta => (
              <div key={encuesta.id} className="encuesta-card">
                <h3>{encuesta.titulo}</h3>
                <p>{encuesta.descripcion}</p>
                <span className={`badge ${encuesta.activa ? 'badge-success' : 'badge-secondary'}`}>
                  {encuesta.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Encuestas;
