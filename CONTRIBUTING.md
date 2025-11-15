# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto de Tlapalería! Este documento te guiará en el proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Guías de Estilo](#guías-de-estilo)
- [Proceso de Pull Request](#proceso-de-pull-request)

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, te comprometes a mantener un ambiente respetuoso y colaborativo.

## ¿Cómo Puedo Contribuir?

### Reportar Bugs

Los bugs se rastrean como issues de GitHub. Antes de crear un issue:

1. **Verifica** si el bug ya ha sido reportado
2. **Describe** el comportamiento esperado vs el actual
3. **Incluye** pasos para reproducir el problema
4. **Agrega** capturas de pantalla si es posible

Plantilla de bug:
```markdown
**Descripción del Bug**
Descripción clara del problema

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '....'
3. Ver error

**Comportamiento Esperado**
Lo que debería pasar

**Capturas de Pantalla**
Si aplica

**Entorno**
- OS: [ej. Windows 10]
- Navegador: [ej. Chrome 120]
- Versión: [ej. 1.0.0]
```

### Sugerir Mejoras

Las sugerencias también se rastrean como issues. Incluye:

1. **Caso de uso**: ¿Por qué es útil esta mejora?
2. **Descripción detallada**: ¿Cómo debería funcionar?
3. **Alternativas**: ¿Consideraste otras soluciones?

### Tu Primera Contribución de Código

¿No sabes por dónde empezar? Busca issues etiquetados con:
- `good first issue`: Tareas simples para principiantes
- `help wanted`: Necesitamos ayuda con estas tareas

### Pull Requests

1. **Fork** el repositorio
2. **Crea** una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-caracteristica
   ```
3. **Haz** tus cambios siguiendo las guías de estilo
4. **Commit** tus cambios:
   ```bash
   git commit -m "Agregar: descripción breve del cambio"
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-caracteristica
   ```
6. **Abre** un Pull Request

## Guías de Estilo

### Commits

Usa mensajes descriptivos en español:

- ✅ **Bueno**: "Agregar validación de stock en ventas"
- ❌ **Malo**: "fix bug"

Prefijos sugeridos:
- `Agregar:` para nuevas características
- `Corregir:` para bugs
- `Actualizar:` para mejoras
- `Eliminar:` para código removido
- `Documentar:` para documentación

### Código JavaScript/React

```javascript
// ✅ Bueno: Comentarios en español, código claro
// Función para calcular el total de una venta
const calcularTotal = (cantidad, precioUnitario) => {
  return cantidad * precioUnitario;
};

// ❌ Malo: Sin comentarios, nombres confusos
const calc = (a, b) => a * b;
```

**Reglas generales:**
- Usa nombres descriptivos en español o inglés consistentemente
- Comenta funciones complejas en español
- Mantén funciones pequeñas y enfocadas
- Usa const/let en lugar de var
- Prefiere funciones flecha para callbacks

### CSS

```css
/* ✅ Bueno: BEM o nombres descriptivos */
.producto-card {
  background: white;
  padding: 1rem;
}

.producto-card__titulo {
  font-weight: bold;
}

.producto-card--destacado {
  border: 2px solid blue;
}

/* ❌ Malo: Nombres genéricos */
.card1 {
  background: white;
}
```

### Estructura de Archivos

**Backend**:
```
backend/
├── src/
│   ├── config/        # Configuración (DB, etc)
│   ├── middleware/    # Middlewares de Express
│   ├── routes/        # Rutas de la API
│   ├── controllers/   # Lógica de negocio (si es necesario)
│   └── server.js      # Punto de entrada
```

**Frontend**:
```
frontend/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── pages/         # Páginas/vistas
│   ├── services/      # Llamadas a API
│   ├── context/       # Context API
│   ├── utils/         # Utilidades
│   └── styles/        # Estilos globales
```

## Proceso de Pull Request

### Checklist Pre-PR

- [ ] El código compila sin errores
- [ ] Los tests pasan (si existen)
- [ ] El código sigue las guías de estilo
- [ ] Los comentarios están en español
- [ ] La documentación se actualizó si es necesario
- [ ] No hay console.logs de debug
- [ ] No hay archivos innecesarios (node_modules, .env, etc)

### Revisión

Los mantenedores revisarán tu PR. Podrían:
- Aprobar y mergear
- Solicitar cambios
- Hacer preguntas

Por favor responde a los comentarios de manera constructiva.

### Después del Merge

1. Tu código será parte del proyecto
2. Aparecerás en los contribuidores
3. ¡Celebra! 🎉

## Desarrollo Local

### Setup Inicial

```bash
# Clonar el repo
git clone https://github.com/Blackmvmba88/Tlapaleria.git
cd Tlapaleria

# Backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Editar .env con tu Google Client ID
```

### Ejecutar en Desarrollo

```bash
# Backend (terminal 1)
cd backend
npm start

# Frontend (terminal 2)
cd frontend
npm run dev
```

### Estructura de Ramas

- `main`: Código estable de producción
- `develop`: Desarrollo activo
- `feature/nombre`: Nuevas características
- `fix/nombre`: Correcciones de bugs
- `docs/nombre`: Cambios de documentación

## Preguntas

¿Tienes preguntas? Abre un issue con la etiqueta `question`.

## Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Express](https://expressjs.com/)
- [Guía de Git](https://git-scm.com/doc)

---

¡Gracias por contribuir! 🚀
