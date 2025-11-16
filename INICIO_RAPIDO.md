# 🚀 Guía Rápida - Tlapalería CLI

**Autor:** Iyari Cancino Gomez  
**Cliente:** Jesús Morán

## Inicio Rápido en 3 Pasos

### Paso 1: Inicializar la Base de Datos

```bash
python3 inicializar_db.py
```

Esto creará la base de datos con 10 productos de ejemplo.

### Paso 2: Ver el Inventario

```bash
python3 tlapaleria_cli.py listar
```

### Paso 3: Explorar Comandos

```bash
# Ver ayuda
python3 tlapaleria_cli.py --help

# Ver productos con stock bajo
python3 tlapaleria_cli.py stock-bajo

# Ver estadísticas
python3 tlapaleria_cli.py estadisticas
```

## Comandos Más Usados

### Gestión de Productos

```bash
# Agregar producto
python3 tlapaleria_cli.py agregar "Tornillos" 25.50 --stock 100

# Buscar producto
python3 tlapaleria_cli.py buscar "martillo"

# Actualizar stock
python3 tlapaleria_cli.py actualizar-stock 1 50
```

### Ventas

```bash
# Registrar una venta
python3 tlapaleria_cli.py venta 1 3
```

### Monitoreo

```bash
# Productos con stock bajo
python3 tlapaleria_cli.py stock-bajo

# Estadísticas generales
python3 tlapaleria_cli.py estadisticas
```

## Ejemplos Prácticos

### Flujo de Trabajo Diario

```bash
# 1. Ver estado del inventario
python3 tlapaleria_cli.py estadisticas

# 2. Verificar productos con stock bajo
python3 tlapaleria_cli.py stock-bajo

# 3. Buscar un producto para vender
python3 tlapaleria_cli.py buscar "martillo"

# 4. Registrar venta (producto ID 1, cantidad 2)
python3 tlapaleria_cli.py venta 1 2

# 5. Verificar actualización
python3 tlapaleria_cli.py listar
```

### Agregar Nuevo Producto Completo

```bash
python3 tlapaleria_cli.py agregar "Taladro eléctrico" 850.00 \
  --stock 8 \
  --codigo "7502345678901" \
  --categoria "Herramientas eléctricas" \
  --ubicacion "Pasillo C1" \
  --proveedor "Herramientas Pro" \
  --stock-minimo 5 \
  --descripcion "Taladro eléctrico 500W con velocidad variable"
```

## Atajos Útiles

### Alias de Bash (opcional)

Agrega estos alias a tu `~/.bashrc` o `~/.zshrc`:

```bash
alias tl='python3 tlapaleria_cli.py'
alias tl-listar='python3 tlapaleria_cli.py listar'
alias tl-stock='python3 tlapaleria_cli.py stock-bajo'
alias tl-stats='python3 tlapaleria_cli.py estadisticas'
```

Después de recargar tu terminal:

```bash
# Uso simplificado
tl listar
tl-stock
tl-stats
tl buscar "pintura"
```

## Integración con Scripts

### Script de Backup

```bash
#!/bin/bash
# backup_inventario.sh

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"

mkdir -p $BACKUP_DIR

# Exportar estadísticas
python3 tlapaleria_cli.py estadisticas > "$BACKUP_DIR/stats_$FECHA.txt"

# Exportar productos con stock bajo
python3 tlapaleria_cli.py stock-bajo > "$BACKUP_DIR/stock_bajo_$FECHA.txt"

# Copiar base de datos
cp backend/tlapaleria.db "$BACKUP_DIR/db_$FECHA.db"

echo "✅ Backup completado: $BACKUP_DIR"
```

### Script de Reporte Diario

```bash
#!/bin/bash
# reporte_diario.sh

echo "📊 REPORTE DIARIO - $(date '+%d/%m/%Y')"
echo "=================================="
echo ""
python3 tlapaleria_cli.py estadisticas
echo ""
echo "⚠️  PRODUCTOS A REABASTECER:"
echo "=================================="
python3 tlapaleria_cli.py stock-bajo
```

## Solución Rápida de Problemas

### ❌ Error: "No se puede conectar a la base de datos"

```bash
# Verificar que el directorio existe
ls -la backend/

# Si no existe, inicializar
python3 inicializar_db.py
```

### ❌ Error: "command not found: python3"

```bash
# Intenta con python en lugar de python3
python tlapaleria_cli.py listar

# O verifica la versión
python --version
```

### ❌ Base de datos vacía

```bash
# Reinicializar con datos de ejemplo
python3 inicializar_db.py
# Responde 's' cuando pregunte
```

## Tips y Trucos

1. **Búsqueda flexible**: Usa palabras parciales
   ```bash
   python3 tlapaleria_cli.py buscar "mart"  # Encuentra "martillo"
   ```

2. **Limitar resultados**: Usa `--limit` en listar
   ```bash
   python3 tlapaleria_cli.py listar --limit 5
   ```

3. **Verificar antes de vender**: Busca el producto primero
   ```bash
   python3 tlapaleria_cli.py buscar "martillo"
   python3 tlapaleria_cli.py venta 1 2
   ```

4. **Monitoreo constante**: Revisa stock bajo regularmente
   ```bash
   python3 tlapaleria_cli.py stock-bajo
   ```

## Documentación Completa

Para más información, consulta:
- **CLI_README.md**: Documentación completa del CLI
- **README.md**: Información general del proyecto

## Soporte

¿Necesitas ayuda? Visita el repositorio:
https://github.com/Blackmvmba88/Tlapaleria

---

**Desarrollado por:** Iyari Cancino Gomez  
**Para:** Jesús Morán (Cliente)
