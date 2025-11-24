# Tlapalería Mobile App

Aplicación móvil desarrollada con React Native y Expo para el sistema de gestión de tlapalería.

## 📱 Características

- ✅ Login con autenticación JWT
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de inventario con búsqueda
- ✅ Registro de ventas
- ✅ Estadísticas con gráficas interactivas
- ✅ Modo offline con sincronización automática
- ✅ Notificaciones push (configurables)
- ✅ Soporte para Android e iOS

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo CLI
- (Opcional) Expo Go en tu dispositivo móvil

### Pasos de Instalación

1. **Instalar dependencias:**

```bash
cd mobile
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto mobile:

```env
# URL del backend
API_URL=http://tu-servidor:3000/api
```

3. **Iniciar el servidor de desarrollo:**

```bash
npm start
```

4. **Ejecutar en dispositivo:**

- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`
- **Expo Go**: Escanea el código QR con la app Expo Go

## 📦 Modo Offline

La aplicación incluye un sistema de almacenamiento offline que:

- Almacena productos en caché local (SQLite)
- Permite registrar ventas sin conexión
- Sincroniza automáticamente cuando vuelve la conexión
- Muestra indicadores de estado de conexión

## 🔧 Estructura del Proyecto

```
mobile/
├── App.js                          # Componente principal
├── app.json                        # Configuración de Expo
├── package.json                    # Dependencias
├── src/
│   ├── screens/                    # Pantallas de la app
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── InventarioScreen.js
│   │   ├── VentasScreen.js
│   │   └── EstadisticasScreen.js
│   ├── services/                   # Servicios
│   │   ├── api.js                  # Cliente API
│   │   └── offlineStorage.js      # Almacenamiento offline
│   ├── context/                    # Context API
│   │   └── AuthContext.js          # Contexto de autenticación
│   └── components/                 # Componentes reutilizables
└── assets/                         # Imágenes y recursos
```

## 📱 Generar APK para Android (Fase 4)

### Método 1: Usando EAS Build (Recomendado)

1. **Instalar EAS CLI:**

```bash
npm install -g eas-cli
```

2. **Iniciar sesión en Expo:**

```bash
eas login
```

3. **Configurar el proyecto:**

```bash
eas build:configure
```

4. **Generar APK:**

```bash
eas build --platform android --profile preview
```

El APK estará disponible para descargar desde el dashboard de Expo.

### Método 2: Build Local

1. **Instalar dependencias de Android:**
   - Android Studio
   - Java Development Kit (JDK)

2. **Generar APK:**

```bash
npm run android -- --variant=release
```

## 🔔 Configuración de Notificaciones Push

Para habilitar notificaciones push:

1. Obtener credenciales de Firebase Cloud Messaging
2. Configurar en `app.json`:

```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

3. Implementar lógica de notificaciones en `src/services/notifications.js`

## 🌐 Conectar con el Backend

Asegúrate de que el backend esté corriendo en:
- Desarrollo: `http://localhost:3000`
- Producción: URL de tu servidor

Actualiza `src/services/api.js` con la URL correcta.

## 📝 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en navegador
- `npm test` - Ejecuta tests (si están configurados)

## 🐛 Troubleshooting

### Error de conexión con el backend

Si estás usando un dispositivo físico o emulador, asegúrate de:
- Usar la IP local de tu computadora en lugar de `localhost`
- Que el backend esté accesible desde la red local

```javascript
// En api.js, cambiar:
const API_URL = 'http://192.168.1.XXX:3000/api'; // Tu IP local
```

### Problemas con SQLite

Si hay errores con `expo-sqlite`, ejecuta:

```bash
expo install expo-sqlite
```

## 🔐 Seguridad

- Los tokens JWT se almacenan de forma segura en AsyncStorage
- Las credenciales nunca se guardan en texto plano
- Las comunicaciones con el backend deben usar HTTPS en producción

## 📄 Licencia

Este proyecto es parte del sistema Tlapalería Digital.

## 👥 Soporte

Para reportar problemas o solicitar características, abre un issue en el repositorio de GitHub.
