// Página de mensajería entre trabajadores
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Layout from '../components/Layout';
import { mensajesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Mensajes() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    cargarDatos();
    conectarSocket();
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (usuarioSeleccionado) {
      cargarMensajes(usuarioSeleccionado.id);
    }
  }, [usuarioSeleccionado]);

  const conectarSocket = () => {
    const newSocket = io('http://localhost:3000');
    newSocket.emit('join', usuario.id);
    
    newSocket.on('new_message', (mensaje) => {
      setMensajes(prev => [...prev, mensaje]);
    });
    
    setSocket(newSocket);
  };

  const cargarDatos = async () => {
    try {
      const [usuariosRes, conversacionesRes] = await Promise.all([
        authAPI.getUsuarios(),
        mensajesAPI.getConversaciones()
      ]);
      setUsuarios(usuariosRes.data.filter(u => u.id !== usuario.id));
      setConversaciones(conversacionesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarMensajes = async (otroUsuarioId) => {
    try {
      const response = await mensajesAPI.getAll({ conversacion_con: otroUsuarioId });
      setMensajes(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !usuarioSeleccionado) return;

    try {
      const response = await mensajesAPI.send({
        destinatario_id: usuarioSeleccionado.id,
        mensaje: nuevoMensaje
      });
      
      setMensajes([...mensajes, response.data]);
      setNuevoMensaje('');
      
      if (socket) {
        socket.emit('send_message', {
          destinatarioId: usuarioSeleccionado.id,
          mensaje: response.data
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <div className="mensajes-page">
        <h1>💬 Mensajería</h1>
        <div className="mensajes-container">
          <div className="lista-usuarios">
            <h3>Trabajadores</h3>
            {usuarios.map(u => (
              <div
                key={u.id}
                className={`usuario-item ${usuarioSeleccionado?.id === u.id ? 'active' : ''}`}
                onClick={() => setUsuarioSeleccionado(u)}
              >
                {u.foto && <img src={u.foto} alt={u.nombre} />}
                <div>
                  <strong>{u.nombre}</strong>
                  <span>{u.rol}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-container">
            {usuarioSeleccionado ? (
              <>
                <div className="chat-header">
                  <h3>{usuarioSeleccionado.nombre}</h3>
                </div>
                <div className="mensajes-lista">
                  {mensajes.map(m => (
                    <div
                      key={m.id}
                      className={`mensaje ${m.remitente_id === usuario.id ? 'enviado' : 'recibido'}`}
                    >
                      <p>{m.mensaje}</p>
                      <span className="fecha">{new Date(m.fecha_envio).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={enviarMensaje} className="mensaje-form">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                  />
                  <button type="submit" className="btn btn-primary">Enviar</button>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <p>Selecciona un trabajador para iniciar conversación</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Mensajes;
