#!/bin/bash

# Script para iniciar la aplicación de Tlapalería

echo "🏪 Iniciando aplicación de Tlapalería..."

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

# Iniciar backend
echo "📦 Iniciando backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encontró .env en backend"
    echo "Copia .env.example a .env y configura tus credenciales"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del backend..."
    npm install
fi

npm start &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

cd ..

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encontró .env en frontend"
    echo "Copia .env.example a .env y configura tu Google Client ID"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del frontend..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

cd ..

echo ""
echo "🎉 Aplicación iniciada correctamente!"
echo ""
echo "📊 Backend: http://localhost:3000"
echo "🖥️  Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servicios detenidos"
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT TERM

# Esperar indefinidamente
wait
