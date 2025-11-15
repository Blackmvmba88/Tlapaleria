// Componente de layout principal con navegación
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Enlaces de navegación
  const navLinks = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/inventario', icon: '📦', label: 'Inventario' },
    { path: '/ventas', icon: '💰', label: 'Ventas' },
    { path: '/scanner', icon: '📷', label: 'Escanear' },
    { path: '/mensajes', icon: '💬', label: 'Mensajes' },
    { path: '/compras', icon: '🛒', label: 'Compras' },
    { path: '/encuestas', icon: '📋', label: 'Encuestas' },
    { path: '/configuracion', icon: '⚙️', label: 'Config' },
  ];

  return (
    <div className="layout">
      {/* Barra de navegación superior */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🏪 Tlapalería</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            {usuario?.foto && (
              <img src={usuario.foto} alt={usuario.nombre} className="user-avatar" />
            )}
            <span className="user-name">{usuario?.nombre}</span>
            {usuario?.rol === 'admin' && <span className="badge">Admin</span>}
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            Salir
          </button>
        </div>
      </header>

      {/* Navegación lateral */}
      <nav className="sidebar">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
