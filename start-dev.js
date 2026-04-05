#!/usr/bin/env node

// Script para iniciar Next.js con puerto del .env.local
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determinar el archivo de entorno desde ENV_FILE (por defecto .env.local)
const envFile = process.env.ENV_FILE || '.env.local';
const envPath = path.join(__dirname, envFile);

// Puerto por defecto
let port = process.env.PORT || 3000;

// Si no se definió PORT en variables de entorno, intentar leerlo desde el archivo seleccionado
if (!process.env.PORT && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const portMatch = envContent.match(/PORT=(\d+)/);
  if (portMatch) {
    port = portMatch[1];
  }
}

console.log(`🚀 Iniciando Liberty Club SPA en puerto ${port}...`);

// Iniciar Next.js vinculado a 0.0.0.0 para aceptar conexiones desde ngrok
// y usando el puerto específico
const nextProcess = spawn('yarn', ['next', 'dev', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});

nextProcess.on('error', (err) => {
  console.error('Error starting Next.js:', err);
});
