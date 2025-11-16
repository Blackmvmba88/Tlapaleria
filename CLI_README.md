# 🐍 Tlapalería CLI - Herramienta de Terminal en Python

**Autor:** Iyari Cancino Gomez  
**Cliente:** Jesús Morán  
**Versión:** 1.0.0

## 📖 Descripción

Herramienta de línea de comandos en Python para gestionar la tlapalería desde la terminal. Permite realizar todas las operaciones básicas de inventario sin necesidad de usar la interfaz web.

## ✨ Características

- 📦 **Gestión de Inventario**: Agregar, listar, buscar y eliminar productos
- 🔄 **Actualización de Stock**: Modificar cantidades de productos
- 💰 **Registro de Ventas**: Registrar transacciones y actualizar inventario automáticamente
- ⚠️ **Alertas de Stock**: Identificar productos con stock bajo
- 📊 **Estadísticas**: Ver métricas del sistema en tiempo real
- 🎨 **Interfaz Amigable**: Mensajes con emojis y formato claro

## 🚀 Instalación

### Requisitos

- Python 3.7 o superior
- SQLite3 (incluido con Python)

### Instalación

```bash
# Clonar el repositorio (si aún no lo has hecho)
git clone https://github.com/Blackmvmba88/Tlapaleria.git
cd Tlapaleria

# No se requieren dependencias adicionales
# Todo lo necesario está incluido en Python
```

## 📝 Uso

### Comandos Disponibles

#### 1. Listar Productos

```bash
python3 tlapaleria_cli.py listar
```

Opciones:
- `--limit N`: Limitar el número de productos mostrados (por defecto: 50)

Ejemplo:
```bash
python3 tlapaleria_cli.py listar --limit 20
```

#### 2. Buscar Productos

```bash
python3 tlapaleria_cli.py buscar "término"
```

Busca en nombre, descripción y código de barras.

Ejemplos:
```bash
python3 tlapaleria_cli.py buscar "martillo"
python3 tlapaleria_cli.py buscar "7501234567890"
python3 tlapaleria_cli.py buscar "herramienta"
```

#### 3. Agregar Producto

```bash
python3 tlapaleria_cli.py agregar "Nombre" PRECIO [opciones]
```

Opciones:
- `--stock N`: Stock inicial (por defecto: 0)
- `--codigo CODIGO`: Código de barras
- `--descripcion "TEXTO"`: Descripción del producto
- `--stock-minimo N`: Stock mínimo para alertas (por defecto: 10)
- `--categoria "TEXTO"`: Categoría del producto
- `--ubicacion "TEXTO"`: Ubicación en la tienda
- `--proveedor "TEXTO"`: Nombre del proveedor

Ejemplos:
```bash
# Producto básico
python3 tlapaleria_cli.py agregar "Martillo" 250.50

# Producto completo
python3 tlapaleria_cli.py agregar "Martillo de carpintero" 250.50 \
  --stock 15 \
  --codigo "7501234567890" \
  --categoria "Herramientas" \
  --ubicacion "Pasillo A1" \
  --proveedor "Ferretería Nacional" \
  --descripcion "Martillo profesional con mango de madera"

# Producto con stock bajo
python3 tlapaleria_cli.py agregar "Pintura blanca 1L" 180.00 \
  --stock 5 \
  --stock-minimo 10 \
  --categoria "Pinturas"
```

#### 4. Actualizar Stock

```bash
python3 tlapaleria_cli.py actualizar-stock ID NUEVO_STOCK
```

Ejemplos:
```bash
python3 tlapaleria_cli.py actualizar-stock 1 50
python3 tlapaleria_cli.py actualizar-stock 2 100
```

#### 5. Verificar Stock Bajo

```bash
python3 tlapaleria_cli.py stock-bajo
```

Muestra todos los productos que tienen stock actual menor o igual al stock mínimo.

#### 6. Registrar Venta

```bash
python3 tlapaleria_cli.py venta ID_PRODUCTO CANTIDAD [--usuario ID_USUARIO]
```

Registra una venta y actualiza automáticamente el inventario.

Ejemplos:
```bash
# Venta básica
python3 tlapaleria_cli.py venta 1 3

# Venta especificando usuario
python3 tlapaleria_cli.py venta 1 5 --usuario 2
```

#### 7. Ver Estadísticas

```bash
python3 tlapaleria_cli.py estadisticas
```

Muestra:
- Total de productos
- Valor total del inventario
- Productos con stock bajo
- Total de ventas realizadas
- Monto total de ventas
- Producto más vendido

#### 8. Eliminar Producto

```bash
python3 tlapaleria_cli.py eliminar ID
```

Ejemplo:
```bash
python3 tlapaleria_cli.py eliminar 5
```

⚠️ **Advertencia**: Si el producto tiene ventas registradas, se solicitará confirmación.

### Ayuda

Para ver la ayuda general:
```bash
python3 tlapaleria_cli.py --help
```

Para ver ayuda de un comando específico:
```bash
python3 tlapaleria_cli.py agregar --help
python3 tlapaleria_cli.py venta --help
```

## 📊 Ejemplos de Flujo de Trabajo

### Ejemplo 1: Configuración Inicial

```bash
# 1. Agregar productos al inventario
python3 tlapaleria_cli.py agregar "Martillo" 250.50 --stock 20 --categoria "Herramientas"
python3 tlapaleria_cli.py agregar "Pintura blanca" 180.00 --stock 15 --categoria "Pinturas"
python3 tlapaleria_cli.py agregar "Clavos (caja)" 45.50 --stock 50 --categoria "Ferretería"

# 2. Ver el inventario completo
python3 tlapaleria_cli.py listar

# 3. Ver estadísticas iniciales
python3 tlapaleria_cli.py estadisticas
```

### Ejemplo 2: Operaciones Diarias

```bash
# 1. Verificar productos con stock bajo
python3 tlapaleria_cli.py stock-bajo

# 2. Buscar un producto específico
python3 tlapaleria_cli.py buscar "martillo"

# 3. Registrar una venta
python3 tlapaleria_cli.py venta 1 2

# 4. Actualizar stock después de recibir mercancía
python3 tlapaleria_cli.py actualizar-stock 2 50

# 5. Ver estadísticas actualizadas
python3 tlapaleria_cli.py estadisticas
```

### Ejemplo 3: Gestión de Inventario

```bash
# 1. Listar todos los productos
python3 tlapaleria_cli.py listar

# 2. Buscar productos de una categoría
python3 tlapaleria_cli.py buscar "herramientas"

# 3. Verificar stock bajo
python3 tlapaleria_cli.py stock-bajo

# 4. Actualizar stock de productos bajos
python3 tlapaleria_cli.py actualizar-stock 2 30
python3 tlapaleria_cli.py actualizar-stock 5 25
```

## 🎯 Ventajas de la CLI

1. **Rápida**: Operaciones instantáneas desde la terminal
2. **Ligera**: No requiere navegador ni interfaz gráfica
3. **Automatizable**: Fácil de integrar en scripts
4. **Portable**: Funciona en cualquier sistema con Python
5. **Sin dependencias**: Usa solo bibliotecas estándar de Python

## 🔧 Integración con la Aplicación Web

La CLI comparte la misma base de datos (`backend/tlapaleria.db`) que la aplicación web, por lo que:

- ✅ Los cambios realizados en la CLI se reflejan inmediatamente en la web
- ✅ Los cambios de la web se ven en la CLI
- ✅ Puedes usar ambas herramientas simultáneamente

## 🛡️ Base de Datos

La CLI interactúa con SQLite directamente. La base de datos se crea automáticamente en:

```
backend/tlapaleria.db
```

### Tablas Utilizadas

- **productos**: Información de productos e inventario
- **ventas**: Registro de transacciones de venta

## 🐛 Solución de Problemas

### Error: No se puede conectar a la base de datos

```bash
# Asegúrate de que el directorio backend existe
mkdir -p backend

# La base de datos se creará automáticamente al ejecutar cualquier comando
python3 tlapaleria_cli.py estadisticas
```

### Error: El módulo sqlite3 no está disponible

```bash
# En Ubuntu/Debian
sudo apt-get install python3-sqlite3

# En macOS (viene preinstalado)
# En Windows (viene preinstalado)
```

### Verificar versión de Python

```bash
python3 --version
# Debe ser 3.7 o superior
```

## 📚 Referencia Rápida

| Comando | Descripción |
|---------|-------------|
| `listar` | Lista todos los productos |
| `buscar TÉRMINO` | Busca productos |
| `agregar NOMBRE PRECIO` | Agrega nuevo producto |
| `actualizar-stock ID STOCK` | Actualiza stock |
| `stock-bajo` | Productos con stock bajo |
| `venta ID CANTIDAD` | Registra una venta |
| `estadisticas` | Muestra estadísticas |
| `eliminar ID` | Elimina un producto |

## 🤝 Contribuciones

Si deseas contribuir o reportar problemas, visita el repositorio en GitHub:

https://github.com/Blackmvmba88/Tlapaleria

## 📄 Licencia

Este proyecto es parte del sistema de Tlapalería Digital.

---

**Desarrollado por:** Iyari Cancino Gomez  
**Para:** Jesús Morán (Cliente)  
**Proyecto:** Sistema de Gestión para Tlapalería Digital
