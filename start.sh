#!/bin/bash

# Script para iniciar liberty-club-spa con variables de entorno
# Autor: Liberty Club Development Team

# Cargar variables de entorno desde .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar que PORT esté definido
if [ -z "$PORT" ]; then
    PORT=3000
fi

echo "🚀 Iniciando Liberty Club SPA en puerto $PORT..."

# Iniciar el servidor de desarrollo
npm run dev
