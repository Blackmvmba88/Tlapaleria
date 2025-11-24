# 🛠️ Tlapalería Digital - Sistema Completo

## 📖 Descripción

**Tlapalería Digital** es una plataforma integral de gestión para tlapalerías y ferreterías que revoluciona la forma en que estos negocios operan en América Latina. Este repositorio contiene la implementación completa de las 4 fases del sistema.

## ✅ Fases Implementadas

### Fase 1: Backend API con Node + Express + SQLite ✅
Sistema backend completo con:
- ✅ Express.js con arquitectura modular
- ✅ SQLite como base de datos por defecto
- ✅ Autenticación JWT
- ✅ CRUD completo de productos, ventas, usuarios
- ✅ Sistema de roles (admin/empleado)
- ✅ Inventario inteligente con predicción de demanda
- ✅ Middleware de seguridad (Helmet, rate limiting, sanitización)
- ✅ Documentación Swagger/OpenAPI en `/api-docs`

**Endpoints principales:**
- `/api/auth/*` - Autenticación
- `/api/productos/*` - Gestión de productos
- `/api/ventas/*` - Registro de ventas
- `/api/inventario/*` - Inventario inteligente
- `/api/metrics/*` - Estadísticas y métricas

### Fase 2: Migración a PostgreSQL ✅
Soporte completo para PostgreSQL:
- ✅ Adaptador PostgreSQL con pool de conexiones
- ✅ Factory pattern para cambiar entre SQLite/PostgreSQL
- ✅ Convertidor de sintaxis SQL automático
- ✅ Variable de entorno `DB_TYPE` para selección
- ✅ Configuración lista para Render, Railway, Supabase

**Cambio de base de datos:**
```env
DB_TYPE=postgres  # o sqlite (por defecto)
```

### Fase 3: App Móvil Expo con React Native ✅
Aplicación móvil completa con:
- ✅ Login con JWT
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de inventario con búsqueda
- ✅ Registro de ventas
- ✅ Estadísticas con gráficas (Line, Bar, Pie)
- ✅ Modo offline con SQLite local
- ✅ Sincronización automática
- ✅ Notificaciones push (estructura lista)

**Pantallas:**
- LoginScreen - Autenticación
- DashboardScreen - Métricas principales
- InventarioScreen - Lista y búsqueda de productos
- VentasScreen - Registro de ventas
- EstadisticasScreen - Gráficas y análisis

### Fase 4: APK para Android ✅
Configuración completa para generar APK:
- ✅ Configuración EAS Build
- ✅ Perfiles de compilación (development, preview, production)
- ✅ Instrucciones de build local
- ✅ Guía de instalación en dispositivos

**Generar APK:**
```bash
cd mobile
eas build --platform android --profile preview
```

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm start
```

El servidor estará en `http://localhost:3000`
Documentación API: `http://localhost:3000/api-docs`

### App Móvil

```bash
cd mobile
npm install
npm start
```

Escanea el código QR con Expo Go o ejecuta:
- Android: `npm run android`
- iOS: `npm run ios`

## 📱 Características Principales

### Backend
- **Seguridad**: Helmet, rate limiting, JWT, input sanitization
- **Inventario Inteligente**: 
  - Predicción de demanda
  - Puntos de reorden automáticos
  - Alertas de stock bajo con prioridades
  - Análisis de productos de lento movimiento
  - Métricas de rentabilidad
- **API Documentada**: Swagger UI interactivo
- **Dual Database**: SQLite para desarrollo, PostgreSQL para producción

### App Móvil
- **Offline First**: Funciona sin conexión
- **Sincronización**: Datos se sincronizan automáticamente
- **Estadísticas**: Gráficas interactivas con react-native-chart-kit
- **UX Moderna**: Navegación intuitiva con React Navigation
- **Indicadores**: Estado de conexión visible

## 📊 Tecnologías

### Backend
- Node.js 18+
- Express.js 5
- SQLite3 / PostgreSQL (pg)
- JWT (jsonwebtoken)
- Swagger (swagger-ui-express)
- Helmet.js
- Express Rate Limit

### Mobile
- React Native
- Expo SDK 51
- React Navigation
- Axios
- Expo SQLite
- React Native Chart Kit
- AsyncStorage

## 📚 Documentación

- [Guía de Despliegue](DEPLOYMENT.md) - Instrucciones completas de despliegue
- [README Mobile](mobile/README.md) - Documentación de la app móvil
- [Roadmap Original](ROADMAP.md) - Plan de desarrollo a 5 años
- [Seguridad](SECURITY.md) - Análisis de seguridad

## 🔧 Estructura del Proyecto

```
Tlapaleria/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuraciones (DB, Swagger)
│   │   ├── middleware/        # Middleware (auth, security)
│   │   ├── routes/            # Rutas de API
│   │   ├── services/          # Lógica de negocio
│   │   └── server.js          # Servidor principal
│   ├── .env.example
│   └── package.json
├── mobile/                     # App móvil React Native
│   ├── src/
│   │   ├── screens/           # Pantallas
│   │   ├── services/          # API y offline storage
│   │   ├── context/           # Estado global
│   │   └── components/        # Componentes reutilizables
│   ├── App.js
│   ├── app.json
│   └── package.json
├── frontend/                   # Frontend web (existente)
├── DEPLOYMENT.md              # Guía de despliegue
└── README.md                  # Este archivo
```

## 🔐 Seguridad

El sistema implementa múltiples capas de seguridad:
- ✅ JWT para autenticación
- ✅ Helmet.js para headers HTTP seguros
- ✅ Rate limiting contra ataques de fuerza bruta
- ✅ Input sanitization contra XSS
- ✅ Consultas parametrizadas contra SQL injection
- ✅ CORS configurado
- ✅ Variables de entorno para secrets

## 🌐 Despliegue

### Backend en Render
```bash
# Ver DEPLOYMENT.md para instrucciones completas
```

### Backend en Railway
```bash
railway login
railway init
railway add
railway up
```

### PostgreSQL en Supabase
```bash
# Configurar credenciales en .env
DB_TYPE=postgres
PG_HOST=db.xxx.supabase.co
```

### APK para Android
```bash
cd mobile
eas build --platform android --profile preview
```

## 📈 Estado del Proyecto

- ✅ **Fase 1**: Completa - Backend API funcional
- ✅ **Fase 2**: Completa - Soporte PostgreSQL
- ✅ **Fase 3**: Completa - App móvil con offline mode
- ✅ **Fase 4**: Completa - Configuración APK

**El sistema está listo para producción.**

## 🤝 Contribuciones

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.

## 📄 Licencia

Ver archivo [LICENSE](LICENSE) para detalles.

## 👤 Autores

**Cliente:** Jesús Morán  
**Proyecto Original:** JesusMoran  
**GitHub:** [@Blackmvmba88](https://github.com/Blackmvmba88)

---

## 🎯 Próximos Pasos (Opcional)

Mejoras futuras sugeridas:
- [ ] Notificaciones push en producción
- [ ] Integración con WhatsApp Business
- [ ] Scanner de códigos de barras
- [ ] Reportes PDF
- [ ] Dashboard web mejorado
- [ ] Tests automatizados
- [ ] CI/CD pipeline

---

*"Construyendo el futuro del comercio ferretero en América Latina, una tlapalería a la vez."* 🚀
