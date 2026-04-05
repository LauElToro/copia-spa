/** @type {import('next').NextConfig} */
// '' = same-origin (BFF); solo fallback localhost si no definido (evita CORS por IP pública)
const envUrl = (v, fallback) => (v === '' ? '' : (v || fallback));

const nextConfig = {
  // Configuraci?n para suprimir warnings de Node.js
  async rewrites() {
    const libiaUrl = process.env.NEXT_PUBLIC_LIBIA_API_URL || 'https://libia.libertyclub.io';
    
    return [
      // Versionado de API de Libia - mantener consistencia con otros microservicios
      // Nota: El endpoint /ask ahora se maneja con un API route handler para mejor manejo de errores
      // { source: "/api/v1/libia/:path*", destination: `${libiaUrl}/api/v1/:path*` }
    ];
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  eslint: {
    // Temporal: permitir build con warnings de lint - corregir en CI antes de prod
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build de producci?n
    // Esto evita timeouts en deployments - la validaci?n de tipos debe hacerse en CI/CD
    ignoreBuildErrors: true,
  },
  
  // Configuraci?n de variables de entorno
  env: {
    // URLs de microservicios - '' = same-origin (BFF/proxy)
    NEXT_PUBLIC_MS_AUTH_URL: envUrl(process.env.NEXT_PUBLIC_MS_AUTH_URL, 'http://localhost:3001'),
    NEXT_PUBLIC_MS_ACCOUNT_URL: envUrl(process.env.NEXT_PUBLIC_MS_ACCOUNT_URL, 'http://localhost:3002'),
    NEXT_PUBLIC_MS_PLANS_URL: envUrl(process.env.NEXT_PUBLIC_MS_PLANS_URL, 'http://localhost:3003'),
    NEXT_PUBLIC_MS_STORAGE_URL: envUrl(process.env.NEXT_PUBLIC_MS_STORAGE_URL, 'http://localhost:3004'),
    NEXT_PUBLIC_BFF_API_URL: envUrl(process.env.NEXT_PUBLIC_BFF_API_URL, 'http://localhost:3005'),
    NEXT_PUBLIC_MS_TRANSACTIONS_URL: envUrl(process.env.NEXT_PUBLIC_MS_TRANSACTIONS_URL, 'http://localhost:3006'),
    NEXT_PUBLIC_MS_PRODUCTS_URL: envUrl(process.env.NEXT_PUBLIC_MS_PRODUCTS_URL, 'http://localhost:3007'),
    NEXT_PUBLIC_MS_NOTIFICATIONS_URL: envUrl(process.env.NEXT_PUBLIC_MS_NOTIFICATIONS_URL, 'http://localhost:3008'),
    NEXT_PUBLIC_MS_ROLES_PERMISSIONS_URL: envUrl(process.env.NEXT_PUBLIC_MS_ROLES_PERMISSIONS_URL, 'http://localhost:3009'),
    NEXT_PUBLIC_MS_QUESTIONS_ANSWERS_URL: envUrl(process.env.NEXT_PUBLIC_MS_QUESTIONS_ANSWERS_URL, 'http://localhost:3010'),
    NEXT_PUBLIC_MS_STORES_URL: envUrl(process.env.NEXT_PUBLIC_MS_STORES_URL, 'http://localhost:3011'),
    NEXT_PUBLIC_MS_WALLETS_URL: envUrl(process.env.NEXT_PUBLIC_MS_WALLETS_URL, 'http://localhost:3012'),
    NEXT_PUBLIC_MS_PAYMENTS_URL: envUrl(process.env.NEXT_PUBLIC_MS_PAYMENTS_URL, 'http://localhost:3013'),
    NEXT_PUBLIC_MS_SHIPPINGS_URL: envUrl(process.env.NEXT_PUBLIC_MS_SHIPPINGS_URL, 'http://localhost:3014'),
    // LIBIA AI (libia.libertyclub.io)
    NEXT_PUBLIC_LIBIA_API_URL: process.env.NEXT_PUBLIC_LIBIA_API_URL || 'https://libia.libertyclub.io',
    // Base URL para imágenes legacy (S3) - usado cuando imagen es path relativo o media ID
    NEXT_PUBLIC_S3_BASE_URL: process.env.NEXT_PUBLIC_S3_BASE_URL || 'https://prod-libertyclub.s3.us-east-2.amazonaws.com',
    // Prefijo de API - debe coincidir con rutas de microservicios (/api/v1/...)
    NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX || process.env.API_PREFIX || '/api/v1',
    // true = todas las llamadas van al BFF (proxy a MS directo, bypass del gateway)
    NEXT_PUBLIC_USE_BFF_PROXY: process.env.NEXT_PUBLIC_USE_BFF_PROXY || 'false',
    // Prototipo solo frontend: datos mock y sin llamadas reales a microservicios (false para APIs reales)
    NEXT_PUBLIC_FRONTEND_ONLY: process.env.NEXT_PUBLIC_FRONTEND_ONLY ?? 'true',
    // Configuraci?n de la aplicaci?n
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'liberty_club_nextauth_secret_key_2024_very_long_and_secure_string'
  },
  images: {
    // Permitir cualquier dominio - configuraci?n m?s permisiva
    // Nota: Aunque configuramos remotePatterns, las im?genes remotas se marcan como unoptimized
    // para evitar errores 400 con el optimizador de Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'prod-libertyclub.s3.us-east-2.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'test-libertyclub.s3.us-east-2.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.s3-accesspoint.us-east-1.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pruebasliberty-eoh9otqxd56g4xra6t7mukdmgbqtsuse1a-s3alias.s3-accesspoint.us-east-1.amazonaws.com',
        pathname: '**',
      },
    ],
    // Optimizar im?genes incluyendo SVG - mantener unoptimized en false para mejor calidad
    formats: ['image/avif', 'image/webp'],
    // En Netlify el optimizador /_next/image a veces falla con OpenNext; servir src directo.
    unoptimized: process.env.NETLIFY === 'true',
    // Configuraci?n espec?fica para SVG - permitir SVG para mantener calidad vectorial
    dangerouslyAllowSVG: true,
    // CSP permisiva para permitir im?genes de S3 y otros dominios externos
    // Permitir imágenes de cualquier origen para que funcionen en local y producción
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox; img-src 'self' data: https: http: blob:;",
    // Mejorar la calidad de renderizado - mantener dimensiones nativas
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Permitir im?genes del mismo dominio y cualquier otro dominio
    minimumCacheTTL: 60,
  },
  webpack: (config, { dev, isServer }) => {
    config.externals = [...config.externals, { canvas: 'canvas' }];
    
    // Configurar source maps para desarrollo
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    
    // Los SVG en /public se sirven directamente sin procesamiento adicional
    // Next.js ya maneja correctamente los SVG est?ticos
    // No necesitamos configuraci?n especial de webpack para mantener calidad vectorial
    
    // Suprimir warnings de source maps faltantes para CSS de node_modules
    config.ignoreWarnings = [
      {
        module: /node_modules/,
        message: /source-map/,
      },
      {
        file: /\.css$/,
        message: /source-map/,
      },
      /source-map/,
    ];
    
    return config;
  },
  // Configuraci?n para source maps
  productionBrowserSourceMaps: false,
  // Permite importar CSS desde node_modules
  transpilePackages: ['datatables.net', 'datatables.net-responsive'],
  // Requerido por @netlify/plugin-nextjs v5 (verifica .next/standalone). Docker también lo usa.
  output: 'standalone',
  // Configuraci?n experimental - permitir paralelismo en build (Docker/Linux)
  experimental: {
    workerThreads: false,
  },
};

module.exports = nextConfig;