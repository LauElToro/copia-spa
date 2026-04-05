#!/bin/bash

# Script para construir y desplegar Liberty Club SPA en producción
# Asegura que se usen las variables de entorno correctas

set -e

echo "🏗️  Construyendo Liberty Club SPA para producción..."

# Verificar que exista .env.production
if [ ! -f .env.production ]; then
  echo "❌ Error: No se encontró el archivo .env.production"
  echo "💡 Por favor, crea el archivo basándote en env.production.example"
  echo ""
  echo "Ejemplo de contenido para .env.production:"
  echo "NEXT_PUBLIC_MS_AUTH_URL=https://auth.libertyclub.io"
  echo "NEXT_PUBLIC_MS_ACCOUNT_URL=https://account.libertyclub.io"
  echo "NEXT_PUBLIC_MS_PRODUCTS_URL=https://products.libertyclub.io"
  echo "# ... etc"
  exit 1
fi

# Cargar variables de entorno desde .env.production
set -a
source .env.production
set +a

echo "📋 Variables de entorno cargadas desde .env.production"
echo ""

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down || true

# Construir y levantar con docker-compose
echo "🔨 Construyendo imagen con docker-compose..."
docker-compose build --no-cache

echo ""
echo "✅ Construcción completada exitosamente"
echo ""
echo "🚀 Para iniciar el contenedor, ejecuta:"
echo "   docker-compose up -d"
echo ""
echo "📊 Para ver los logs:"
echo "   docker-compose logs -f frontend"

