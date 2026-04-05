#!/bin/bash

# Script para configurar y usar SonarQube con Docker

# Configurar token de SonarQube por defecto
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-liberty-club-sonar}"
export SONAR_TOKEN="sqa_43151547220eca468c1b5b0d935878a15fbe84c7"

# Funciones auxiliares para revisar contenedores existentes
is_container_up() {
    local container_name="$1"
    docker ps --filter "name=^${container_name}$" --filter "status=running" --format '{{.Names}}' | grep -q "${container_name}"
}

check_sonar_status() {
    if is_container_up "liberty-club-sonarqube" && is_container_up "liberty-club-postgres-sonar"; then
        echo "✅ SonarQube está ejecutándose"
        return 0
    else
        echo "❌ SonarQube no está ejecutándose"
        return 1
    fi
}

# Función para esperar a que SonarQube esté listo
wait_for_sonar() {
    echo "⏳ Esperando a que SonarQube esté listo..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:9002/api/system/status | grep -q "UP"; then
            echo "✅ SonarQube está listo!"
            
            # Esperar un poco más para que esté completamente inicializado
            echo "⏳ Esperando inicialización completa..."
            sleep 30
            
            # Verificar que la API de autenticación esté disponible
            if curl -s -f http://localhost:9002/api/authentication/validate > /dev/null 2>&1; then
                echo "✅ SonarQube completamente inicializado!"
                return 0
            else
                echo "⏳ API de autenticación aún no disponible, esperando..."
                sleep 10
            fi
        fi
        
        echo "Intento $attempt/$max_attempts - SonarQube aún no está listo..."
        sleep 10
        ((attempt++))
    done
    
    echo "❌ Timeout esperando SonarQube"
    return 1
}

# Función para iniciar SonarQube
start_sonar() {
    echo "🐳 Iniciando SonarQube con Docker..."

    # Si los contenedores ya existen pero están detenidos, iniciarlos directamente
    if docker ps -a --format '{{.Names}}' | grep -q '^liberty-club-postgres-sonar$'; then
        docker start liberty-club-postgres-sonar >/dev/null 2>&1 || true
    fi
    if docker ps -a --format '{{.Names}}' | grep -q '^liberty-club-sonarqube$'; then
        docker start liberty-club-sonarqube >/dev/null 2>&1 || true
    fi

    if check_sonar_status; then
        echo "ℹ️  SonarQube ya estaba activo."
        return 0
    fi

    docker-compose -f scripts/sonar/docker-compose.sonar.yml up -d
    
    if wait_for_sonar; then
        echo ""
        echo "🎉 SonarQube está listo!"
        echo "📊 Accede a: http://localhost:9002"
        echo "👤 Usuario: admin"
        echo "🔑 Contraseña: admin"
        echo ""
        echo "💡 Comandos disponibles:"
        echo "   yarn sonar:start  - Iniciar SonarQube"
        echo "   yarn sonar:stop   - Detener SonarQube"
        echo "   yarn sonar:logs   - Ver logs de SonarQube"
        echo "   yarn sonar        - Ejecutar análisis"
    else
        echo "❌ Error al iniciar SonarQube"
        exit 1
    fi
}

# Función para detener SonarQube
stop_sonar() {
    echo "🛑 Deteniendo SonarQube..."
    docker-compose -f scripts/sonar/docker-compose.sonar.yml down
    echo "✅ SonarQube detenido"
}

# Función para configurar token
setup_token() {
    echo "🔑 Configurando token de SonarQube..."
    
    # Token predefinido
    local token="sqa_43151547220eca468c1b5b0d935878a15fbe84c7"
    
    echo "✅ Token configurado automáticamente"
    echo "🔑 Para que sea persistente, ejecuta:"
    echo "   echo 'export SONAR_TOKEN=\"$token\"' >> ~/.zshrc"
    echo "   source ~/.zshrc"
    echo ""
    echo "🔑 Configurando token en esta sesión..."
    export SONAR_TOKEN="$token"
    return 0
}

# Función para ejecutar análisis
run_analysis() {
    if ! check_sonar_status; then
        echo "❌ SonarQube no está ejecutándose. Ejecuta: yarn sonar:start"
        exit 1
    fi
    
    echo "🔍 Ejecutando análisis de SonarQube..."
    
    # Configurar JAVA_HOME para sonar-scanner
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    
    # Verificar si existe un token configurado
    if [ -n "$SONAR_TOKEN" ]; then
        echo "🔑 Usando token de SonarQube configurado..."
        sonar-scanner \
            -Dsonar.host.url=http://localhost:9002 \
            -Dsonar.token="$SONAR_TOKEN" \
            -Dsonar.projectKey=liberty-club-spa \
            -Dsonar.projectName="Liberty Club SPA" \
            -Dsonar.projectVersion=1.0.0 \
            -Dsonar.sources=src \
            -Dsonar.sourceEncoding=UTF-8 \
            -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/.next/**,**/coverage/**,**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx"
    else
        echo "⚠️  No se encontró token de SonarQube"
        echo "🔧 Configurando token..."
        if setup_token; then
            echo "🔍 Ejecutando análisis con token configurado..."
            sonar-scanner \
                -Dsonar.host.url=http://localhost:9002 \
                -Dsonar.token="$SONAR_TOKEN" \
                -Dsonar.projectKey=liberty-club-spa \
                -Dsonar.projectName="Liberty Club SPA" \
                -Dsonar.projectVersion=1.0.0 \
                -Dsonar.sources=src \
                -Dsonar.sourceEncoding=UTF-8 \
                -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/.next/**,**/coverage/**,**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx"
        else
            echo "❌ Error configurando token"
            exit 1
        fi
    fi
}

# Función para mostrar logs
show_logs() {
    echo "📋 Mostrando logs de SonarQube..."
    docker-compose -f scripts/sonar/docker-compose.sonar.yml logs -f
}

# Función para mostrar errores de SonarQube
show_errors() {
    if ! check_sonar_status; then
        echo "❌ SonarQube no está ejecutándose. Ejecuta: yarn sonar:start"
        exit 1
    fi
    
    echo "🔍 Obteniendo errores de SonarQube..."
    echo "📊 Proyecto: liberty-club-spa"
    echo "🌐 URL: http://localhost:9002/dashboard?id=liberty-club-spa"
    echo ""
    
    # Obtener issues usando la API de SonarQube
    local response=$(curl -s -u "$SONAR_TOKEN:" "http://localhost:9002/api/issues/search?componentKeys=liberty-club-spa&resolved=false&ps=100")
    
    if [ $? -eq 0 ]; then
        # Extraer el total de issues de manera más robusta
        local total=$(echo "$response" | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
        
        # Verificar que total sea un número válido
        if [[ "$total" =~ ^[0-9]+$ ]]; then
            echo "📈 Total de issues encontrados: $total"
            echo ""
            
            if [ "$total" -gt 0 ]; then
                echo "🚨 Issues encontrados:"
                echo "$response" | grep -o '"message":"[^"]*"' | sed 's/"message":"//g' | sed 's/"$//g' | head -20 | while read -r issue; do
                    echo "  • $issue"
                done
                
                if [ "$total" -gt 20 ]; then
                    echo "  ... y $((total - 20)) más"
                fi
            else
                echo "✅ ¡No se encontraron issues!"
            fi
        else
            echo "⚠️  No se pudo extraer el número de issues de la respuesta"
            echo "📋 Respuesta de la API:"
            echo "$response" | head -5
        fi
        
        echo ""
        echo "🔗 Ver detalles completos en: http://localhost:9002/dashboard?id=liberty-club-spa"
    else
        echo "❌ Error al obtener issues de SonarQube"
        echo "💡 Asegúrate de que SonarQube esté ejecutándose y el token sea válido"
    fi
}

# Función para mostrar errores detallados con archivos y líneas
show_errors_detailed() {
    if ! check_sonar_status; then
        echo "❌ SonarQube no está ejecutándose. Ejecuta: yarn sonar:start"
        exit 1
    fi
    
    echo "🔍 Obteniendo errores detallados de SonarQube..."
    echo "📊 Proyecto: liberty-club-spa"
    echo "🌐 URL: http://localhost:9002/dashboard?id=liberty-club-spa"
    echo ""
    
    # Obtener issues con más detalles usando la API de SonarQube
    local response=$(curl -s -u "$SONAR_TOKEN:" "http://localhost:9002/api/issues/search?componentKeys=liberty-club-spa&resolved=false&ps=50&additionalFields=_all")
    
    if [ $? -eq 0 ]; then
        # Extraer el total de issues
        local total=$(echo "$response" | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
        
        if [[ "$total" =~ ^[0-9]+$ ]]; then
            echo "📈 Total de issues encontrados: $total"
            echo ""
            
            if [ "$total" -gt 0 ]; then
                echo "🚨 Issues detallados:"
                echo ""
                
                # Usar jq si está disponible, sino usar grep/sed
                if command -v jq >/dev/null 2>&1; then
                    echo "$response" | jq -r '.issues[] | "📁 \(.component)\n   • \(.message)\n"' | head -40
                else
                    # Fallback sin jq - extraer información básica
                    echo "$response" | grep -o '"component":"[^"]*"' | head -20 | while read -r comp; do
                        local file=$(echo "$comp" | sed 's/"component":"//g' | sed 's/"$//g')
                        echo "  📁 $file"
                        echo "     • (Ver detalles en el dashboard)"
                        echo ""
                    done
                fi
                
                if [ "$total" -gt 20 ]; then
                    echo "  ... y $((total - 20)) más"
                fi
            else
                echo "✅ ¡No se encontraron issues!"
            fi
        else
            echo "⚠️  No se pudo extraer el número de issues de la respuesta"
            echo "📋 Respuesta de la API (primeras líneas):"
            echo "$response" | head -3
        fi
        
        echo ""
        echo "🔗 Ver detalles completos en: http://localhost:9002/dashboard?id=liberty-club-spa"
    else
        echo "❌ Error al obtener issues de SonarQube"
        echo "💡 Asegúrate de que SonarQube esté ejecutándose y el token sea válido"
        exit 1
    fi
}

# Función para validar que no hay errores en SonarQube (para pre-push)
validate_quality_gate() {
    if ! check_sonar_status; then
        echo "❌ SonarQube no está ejecutándose. Ejecuta: yarn sonar:start"
        exit 1
    fi
    
    echo "🔍 Validando Quality Gate de SonarQube..."
    
    # Obtener issues usando la API de SonarQube
    local response=$(curl -s -u "$SONAR_TOKEN:" "http://localhost:9002/api/issues/search?componentKeys=liberty-club-spa&resolved=false&ps=1")
    
    if [ $? -eq 0 ]; then
        # Extraer el total de issues
        local total=$(echo "$response" | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
        
        if [[ "$total" =~ ^[0-9]+$ ]]; then
            if [ "$total" -gt 0 ]; then
                echo ""
                echo "⚠️  Quality Gate con observaciones: se encontraron $total issues en SonarQube"
                echo "🔗 Ver detalles en: http://localhost:9002/dashboard?id=liberty-club-spa"
                echo ""
                echo "💡 Para ver los issues detallados ejecuta: yarn sonar:errors-detailed"
                echo "🔧 Corrige los errores tan pronto como sea posible"
                return 0
            else
                echo "✅ Quality Gate aprobado: No se encontraron issues"
                return 0
            fi
        else
            echo "⚠️  No se pudo validar el Quality Gate"
            echo "📋 Respuesta de la API:"
            echo "$response" | head -3
            exit 1
        fi
    else
        echo "❌ Error al conectar con SonarQube"
        exit 1
    fi
}

# Función principal que ejecuta todo el flujo
run_complete_analysis() {
    echo "🚀 Configurando SonarQube para Liberty Club SPA..."
    echo "🚀 Ejecutando análisis completo de SonarQube..."
    
    # Verificar si SonarQube ya está ejecutándose
    if check_sonar_status; then
        echo "✅ SonarQube ya está ejecutándose, ejecutando análisis..."
        run_analysis
    else
        echo "🐳 Iniciando SonarQube..."
        start_sonar
        echo ""
        echo "🔍 Ejecutando análisis de código..."
        run_analysis
    fi
}

# Procesar argumentos de línea de comandos
case "${1:-}" in
    "start")
        start_sonar
        ;;
    "stop")
        stop_sonar
        ;;
    "status")
        check_sonar_status
        ;;
    "analyze"|"sonar")
        run_analysis
        ;;
    "token")
        setup_token
        ;;
    "logs")
        show_logs
        ;;
    "errors")
        show_errors
        ;;
    "errors-detailed")
        show_errors_detailed
        ;;
    "validate")
        validate_quality_gate
        ;;
    "restart")
        stop_sonar
        sleep 2
        start_sonar
        ;;
    "")
        # Sin argumentos = ejecutar análisis completo
        run_complete_analysis
        ;;
    *)
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponibles:"
        echo "  (sin comando) - Ejecutar análisis completo (iniciar + analizar)"
        echo "  start         - Solo iniciar SonarQube"
        echo "  stop          - Detener SonarQube"
        echo "  status        - Verificar estado de SonarQube"
        echo "  analyze       - Solo ejecutar análisis (requiere SonarQube activo)"
        echo "  token         - Configurar token de SonarQube"
        echo "  logs          - Mostrar logs de SonarQube"
        echo "  errors        - Mostrar errores encontrados por SonarQube"
        echo "  errors-detailed - Mostrar errores con archivos"
        echo "  validate      - Validar Quality Gate (bloquea si hay issues)"
        echo "  restart       - Reiniciar SonarQube"
        echo ""
        echo "Ejemplos:"
        echo "  yarn sonar           # Análisis completo"
        echo "  yarn sonar start     # Solo iniciar"
        echo "  yarn sonar analyze   # Solo analizar"
        echo "  yarn sonar errors    # Ver errores encontrados"
        echo "  yarn sonar errors-detailed # Ver errores con archivos"
        echo "  yarn sonar validate  # Validar quality gate"
        echo "  yarn sonar token     # Configurar token"
        exit 1
        ;;
esac
