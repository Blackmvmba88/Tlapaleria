# 🚀 Guía de Despliegue - Tlapalería Digital

Esta guía cubre el despliegue completo del sistema Tlapalería Digital en todas sus fases.

## 📋 Tabla de Contenidos

1. [Fase 1: Backend API con SQLite](#fase-1-backend-api-con-sqlite)
2. [Fase 2: Migración a PostgreSQL](#fase-2-migración-a-postgresql)
3. [Fase 3: App Móvil](#fase-3-app-móvil)
4. [Fase 4: APK para Android](#fase-4-apk-para-android)

---

## Fase 1: Backend API con SQLite

### Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Puerto 3000 disponible

### Instalación

```bash
cd backend
npm install
cp .env.example .env
```

### Configuración

Edita el archivo `.env`:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=tu-session-secret-aqui
JWT_SECRET=tu-jwt-secret-aqui
DB_TYPE=sqlite
```

### Iniciar Servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`.

### Documentación API

Accede a la documentación interactiva en: `http://localhost:3000/api-docs`

### Endpoints Principales

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/productos` - Listar productos
- `POST /api/ventas` - Registrar venta
- `GET /api/metrics/dashboard` - Métricas del dashboard
- `GET /api/inventario/alertas` - Alertas de stock

---

## Fase 2: Migración a PostgreSQL

### Opción A: PostgreSQL Local

1. **Instalar PostgreSQL**

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

2. **Crear Base de Datos**

```bash
psql -U postgres
CREATE DATABASE tlapaleria;
CREATE USER tlapaleria_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE tlapaleria TO tlapaleria_user;
\q
```

3. **Configurar .env**

```env
DB_TYPE=postgres
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=tlapaleria
PG_USER=tlapaleria_user
PG_PASSWORD=tu_password
PG_SSL=false
```

4. **Reiniciar Backend**

```bash
npm start
```

Las tablas se crearán automáticamente al iniciar.

### Opción B: Despliegue en Render

1. **Crear cuenta en Render.com**

2. **Crear PostgreSQL Database**
   - Ve a Dashboard → New → PostgreSQL
   - Copia la `DATABASE_URL`

3. **Crear Web Service**
   - Ve a Dashboard → New → Web Service
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Environment Variables**:
       ```
       NODE_ENV=production
       DB_TYPE=postgres
       DATABASE_URL=postgresql://...
       JWT_SECRET=tu-secret-aqui
       SESSION_SECRET=tu-secret-aqui
       ```

4. **Desplegar**
   - Haz clic en "Create Web Service"
   - Render desplegará automáticamente

### Opción C: Despliegue en Railway

1. **Crear cuenta en Railway.app**

2. **Crear nuevo proyecto**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"

3. **Agregar PostgreSQL**
   - Haz clic en "+ New"
   - Selecciona "Database" → "PostgreSQL"
   - Railway generará las credenciales automáticamente

4. **Configurar Backend**
   - Selecciona tu servicio backend
   - Ve a "Variables"
   - Agrega:
     ```
     NODE_ENV=production
     DB_TYPE=postgres
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=tu-secret-aqui
     SESSION_SECRET=tu-secret-aqui
     ```

5. **Desplegar**
   - Railway desplegará automáticamente en cada push

### Opción D: Despliegue en Supabase

1. **Crear cuenta en Supabase.com**

2. **Crear nuevo proyecto**
   - Dashboard → New Project
   - Copia las credenciales de PostgreSQL

3. **Configurar Backend**

```env
DB_TYPE=postgres
PG_HOST=db.xxx.supabase.co
PG_PORT=5432
PG_DATABASE=postgres
PG_USER=postgres
PG_PASSWORD=tu-password-supabase
PG_SSL=true
```

4. **Desplegar Backend** (usar Render, Railway o servidor propio)

---

## Fase 3: App Móvil

### Desarrollo Local

1. **Instalar dependencias**

```bash
cd mobile
npm install
```

2. **Configurar API URL**

Edita `src/services/api.js`:

```javascript
const API_URL = __DEV__ 
  ? 'http://TU_IP_LOCAL:3000/api'  // Cambia por tu IP
  : 'https://tu-backend.render.com/api';  // URL de producción
```

3. **Iniciar en desarrollo**

```bash
npm start
```

4. **Probar en dispositivo**
   - Instala Expo Go en tu teléfono
   - Escanea el código QR
   - O usa emulador: `npm run android` / `npm run ios`

### Características de la App

- ✅ **Login**: Autenticación con JWT
- ✅ **Dashboard**: Métricas en tiempo real
- ✅ **Inventario**: Búsqueda y gestión de productos
- ✅ **Ventas**: Registro rápido de transacciones
- ✅ **Estadísticas**: Gráficas interactivas
- ✅ **Modo Offline**: Sincronización automática
- ✅ **Notificaciones**: Alertas de stock

---

## Fase 4: APK para Android

### Método 1: EAS Build (Recomendado)

1. **Instalar EAS CLI**

```bash
npm install -g eas-cli
```

2. **Iniciar sesión**

```bash
cd mobile
eas login
```

3. **Configurar proyecto**

```bash
eas build:configure
```

4. **Generar APK**

```bash
eas build --platform android --profile preview
```

5. **Descargar APK**
   - Ve al enlace que proporciona EAS
   - Descarga el APK
   - Comparte o instala en dispositivos

### Método 2: Build Local (Avanzado)

#### Prerrequisitos

- Android Studio instalado
- Java Development Kit (JDK 11+)
- Variables de entorno configuradas

#### Pasos

1. **Preparar proyecto**

```bash
cd mobile
expo prebuild --platform android
```

2. **Generar APK de desarrollo**

```bash
cd android
./gradlew assembleRelease
```

3. **Ubicación del APK**

```
android/app/build/outputs/apk/release/app-release.apk
```

### Instalación del APK

#### En dispositivo Android

1. **Habilitar instalación de fuentes desconocidas**
   - Configuración → Seguridad → Fuentes desconocidas ✓

2. **Transferir APK al dispositivo**
   - USB, email, o descarga directa

3. **Instalar**
   - Abre el archivo APK
   - Acepta los permisos
   - ¡Listo!

#### Distribución

- **Google Play Store** (Publicación oficial)
- **Enlace directo** (APK en servidor)
- **Plataformas alternativas** (F-Droid, APKPure)

---

## 🔒 Seguridad en Producción

### Backend

- ✅ Usa HTTPS en producción
- ✅ Configura variables de entorno seguras
- ✅ Implementa rate limiting (ya incluido)
- ✅ Actualiza dependencias regularmente
- ✅ Monitorea logs y errores

### Base de Datos

- ✅ Usa contraseñas fuertes
- ✅ Restringe acceso por IP (whitelist)
- ✅ Habilita SSL/TLS
- ✅ Realiza backups automáticos
- ✅ Monitorea rendimiento

### App Móvil

- ✅ Nunca incluyas secrets en el código
- ✅ Usa variables de entorno
- ✅ Implementa certificate pinning
- ✅ Ofusca el código en producción
- ✅ Valida entrada de usuario

---

## 📊 Monitoreo y Mantenimiento

### Backend

```bash
# Ver logs en Render
render logs -f

# Ver logs en Railway
railway logs

# Ver logs en servidor
pm2 logs
```

### Base de Datos

```sql
-- Ver tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('tlapaleria'));

-- Ver tablas más grandes
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;
```

### App Móvil

- Monitorea crashes con Sentry
- Analiza métricas con Firebase Analytics
- Recibe feedback de usuarios

---

## 🆘 Troubleshooting

### Backend no inicia

```bash
# Verificar puerto ocupado
lsof -i :3000

# Verificar logs
npm start --verbose

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión a PostgreSQL

```bash
# Verificar servicio PostgreSQL
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar credenciales
psql -U usuario -d tlapaleria -h localhost
```

### App móvil no conecta al backend

1. Verifica que el backend esté corriendo
2. Usa IP local en lugar de localhost
3. Verifica firewall y permisos de red
4. Prueba con: `curl http://TU_IP:3000/api/health`

### APK no instala

1. Verifica arquitectura del dispositivo
2. Habilita instalación de fuentes desconocidas
3. Libera espacio en el dispositivo
4. Desinstala versión anterior si existe

---

## 📝 Checklist de Despliegue

### Pre-Despliegue

- [ ] Código testeado localmente
- [ ] Variables de entorno configuradas
- [ ] Dependencias actualizadas
- [ ] Documentación actualizada
- [ ] Backup de base de datos realizado

### Backend

- [ ] Servidor corriendo sin errores
- [ ] Base de datos conectada
- [ ] API documentada en /api-docs
- [ ] SSL/HTTPS configurado
- [ ] Rate limiting activo

### App Móvil

- [ ] APK generado exitosamente
- [ ] Instalación probada en dispositivos
- [ ] Conexión al backend verificada
- [ ] Modo offline funcional
- [ ] Notificaciones configuradas

### Post-Despliegue

- [ ] Monitoreo configurado
- [ ] Logs revisados
- [ ] Rendimiento verificado
- [ ] Usuarios notificados
- [ ] Documentación publicada

---

## 🎯 Próximos Pasos

1. **Optimización**
   - Implementar caché Redis
   - Optimizar consultas SQL
   - Comprimir imágenes

2. **Características Nuevas**
   - Sistema de reportes avanzados
   - Integración con WhatsApp
   - Scanner de códigos de barras

3. **Escalabilidad**
   - Microservicios
   - Load balancing
   - CDN para assets

---

## 💬 Soporte

¿Necesitas ayuda? 

- 📧 Email: soporte@tlapaleria.com
- 💬 GitHub Issues: [Reportar problema](https://github.com/Blackmvmba88/Tlapaleria/issues)
- 📚 Documentación: [Wiki del proyecto](https://github.com/Blackmvmba88/Tlapaleria/wiki)

---

**¡Feliz despliegue! 🚀**
