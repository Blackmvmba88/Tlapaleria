# 🏪 Tlapalería - Sistema de Gestión Open Source

Sistema completo de gestión para tlapalería (ferretería) desarrollado con tecnologías modernas, minimalista, rápido y modular.

## ✨ Características

### 📦 Gestión de Inventario
- CRUD completo de productos
- Categorización y búsqueda avanzada
- Control de stock con alertas automáticas
- Gestión de ubicaciones y proveedores

### 📷 Escaneo con Cámara
- Escaneo de códigos de barras en tiempo real
- Búsqueda instantánea de productos
- Compatible con múltiples formatos de códigos

### 💰 Sistema de Ventas
- Registro rápido de ventas
- Historial completo de transacciones
- Actualización automática de inventario

### ⚠️ Alertas de Stock
- Notificaciones de productos con stock bajo
- Umbrales configurables por producto
- Vista consolidada de alertas

### 💬 Mensajería entre Trabajadores
- Chat en tiempo real con Socket.IO
- Conversaciones privadas
- Notificaciones de mensajes nuevos

### 📊 Panel de Métricas (Dashboard de Jesús Morán)
- Media de ventas
- Moda (producto más vendido)
- Top productos más vendidos
- Gráficas interactivas con Chart.js
- Ventas por día y por categoría
- Resumen de inventario

### 📋 Encuestas de Clientes
- Sistema de encuestas de satisfacción
- Análisis de respuestas
- Estadísticas y calificaciones

### 🛒 Compras Futuras
- Lista de productos a reponer
- Priorización automática basada en stock
- Generación automática de solicitudes

### 💾 Backup a Google Drive
- Exportación automática de base de datos
- Integración con Google Drive API
- Historial de backups

### 🔐 Autenticación
- Login con Google OAuth
- Sistema de roles (trabajador/admin)
- Rutas protegidas

## 🚀 Tecnologías

### Frontend
- React 18
- Vite (build tool ultra-rápido)
- React Router (navegación)
- Chart.js (gráficas)
- Socket.IO Client (mensajería en tiempo real)
- HTML5-QRCode (escaneo de códigos)
- Axios (peticiones HTTP)

### Backend
- Node.js
- Express
- SQLite (base de datos)
- Socket.IO (WebSockets)
- Passport (autenticación)
- Google OAuth 2.0
- Google Drive API
- JWT (tokens)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Google para OAuth
- Proyecto en Google Cloud Console (para OAuth y Drive API)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Blackmvmba88/Tlapaleria.git
cd Tlapaleria
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=tu-secret-de-sesion
JWT_SECRET=tu-secret-jwt
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edita `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

### 4. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita "Google+ API"
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:5173` como URI de origen autorizado
6. Copia el Client ID y Client Secret

### 5. Configurar Google Drive API (Opcional)

1. En el mismo proyecto, habilita "Google Drive API"
2. Crea una cuenta de servicio
3. Descarga el JSON de credenciales
4. Copia el contenido al `.env` del backend en `GOOGLE_DRIVE_CREDENTIALS`

## 🎯 Ejecutar la Aplicación

### Backend

```bash
cd backend
npm start
```

El servidor estará en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará en `http://localhost:5173`

## 📱 Uso

1. **Login**: Inicia sesión con tu cuenta de Google
2. **Dashboard**: Ve las métricas generales y alertas
3. **Inventario**: Gestiona productos, stock y categorías
4. **Scanner**: Escanea códigos de barras con la cámara
5. **Ventas**: Registra transacciones de venta
6. **Mensajes**: Comunícate con otros trabajadores
7. **Compras**: Gestiona solicitudes de reposición
8. **Encuestas**: Crea y analiza encuestas de clientes
9. **Configuración**: Crea backups y configura el sistema

## 👥 Roles de Usuario

- **Trabajador**: Acceso a todas las funciones operativas
- **Admin**: Acceso completo + backups y configuración avanzada

## 🗂️ Estructura del Proyecto

```
Tlapaleria/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── routes/         # Rutas de API
│   │   ├── middleware/     # Middlewares
│   │   └── server.js       # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # API services
│   │   ├── context/        # React Context
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔒 Seguridad

- Autenticación JWT
- Rutas protegidas
- Validación de datos
- Control de acceso por roles
- Variables de entorno para secretos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es open source y está disponible bajo la licencia especificada en el archivo LICENSE.

## 👤 Autor

Jesús Morán - [GitHub](https://github.com/Blackmvmba88)

## 🙏 Agradecimientos

- Comunidad de React y Node.js
- Todos los contribuidores del proyecto
- Librerías open source utilizadas

---

**Nota**: Este es un proyecto educativo y open source. Todos los comentarios en el código están en español para facilitar el aprendizaje y colaboración.
