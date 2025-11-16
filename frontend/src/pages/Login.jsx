// Página de Login con Google OAuth
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Manejar respuesta exitosa de Google
  const handleSuccess = async (credentialResponse) => {
    try {
      // Decodificar el token JWT de Google
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Extraer información del usuario
      const userData = {
        googleId: decoded.sub,
        email: decoded.email,
        nombre: decoded.name,
        foto: decoded.picture,
      };

      // Enviar al backend
      await login(userData);
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
    }
  };

  // Manejar error de login
  const handleError = () => {
    console.error('Login fallido');
    alert('No se pudo iniciar sesión con Google.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏪 Tlapalería</h1>
        <p className="subtitle">Sistema de Gestión</p>
        
        <div className="login-content">
          <h2>Bienvenido</h2>
          <p>Inicia sesión con tu cuenta de Google para continuar</p>
          
          <div className="google-button-wrapper">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              text="signin_with"
              shape="rectangular"
              theme="filled_blue"
              size="large"
              locale="es"
            />
          </div>
        </div>

        <footer className="login-footer">
          <p>Sistema open-source para gestión de tlapalería</p>
          <p>Inventario • Ventas • Alertas • Mensajería</p>
        </footer>
      </div>
    </div>
  );
}

export default Login;
