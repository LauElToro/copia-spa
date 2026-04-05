export type Plan = {
  name: string;
  description?: string;
  intro?: string;
  price?: string;
  monthly?: string;
  annual?: string;
  icon?: string;
  benefits: string[];
  isFree?: boolean;
};

// Beneficios por plan
export const benefitsStarter: string[] = [
  "Pagos en Cripto: Abrir nuevos canales de ventas y captar clientes digitales.",
  "Activación Rápida: Con IA, configuras tu tienda y arrancas en menos tiempo.",
  "Más Productos, Más Ventas: Cuantos más productos subas, más chances de vender.",
  "Soporte Humano: Te ayudamos a estar operativo sin complicaciones.",
  "Tienda Propia: Tenés tu propio espacio digital, más visible que en listados generales."
];

export const benefitsLiberty: string[] = [
  "Más opciones de pago, más ventas cerradas: Sumá cripto y los principales medios de pago.",
  "Operatividad estable con asistencia constante: Siempre disponible para que tu tienda no se detenga.",
  "Más catálogo, más ingresos: Publicá un amplio catálogo y atraé clientes que compran y vuelven.",
  "Clientes que vuelven y te recuerdan: Tu tienda propia te ayuda a fidelizar y construir reconocimiento.",
  "IA que resuelve problemas: Mantiene tu tienda activa y evita bloqueos.",
  "CRM con Agente IA: Responde consultas, atiende clientes y cierra ventas automáticamente."
];

export const benefitsPro: string[] = [
  "Clientes que gastan más: Atraé compradores de mayor ticket.",
  "Más tráfico, más ventas: Tu tienda aparece destacada en los primeros lugares del ecosistema.",
  "Más productos, más facturación: Publicar mucho te posiciona como referente en tu categoría.",
  "Agente IA que vende por vos: Genera ventas automáticas.",
  "Cero frenos, ventas sin interrupciones.",
  "Métricas avanzadas y exposición destacada.",
  "Publicidad enfocada en resultados: Anuncios diseñados para aumentar ventas."
];

export const benefitsExperiencia: string[] = [
  "Agente IA que Atiende y Cierra Ventas.",
  "Ejecutivo de Cuenta Dedicado.",
  "Campañas Profesionales en Redes Sociales.",
  "Modelo de Comisiones por Venta.",
  "Análisis de datos con Seguimiento Activo."
];

// Datos de planes
export const plansData: Plan[] = [
  {
    name: "Plan Starter",
    description: "Nuevo canal de ventas",
    price: "Gratuito",
    icon: "/card-1.svg",
    benefits: benefitsStarter,
    isFree: true
  },
  {
    name: "Plan Liberty",
    description: "Automatiza tus ventas",
    monthly: "20 USD/mes",
    annual: "200 USD/año",
    icon: "/card-2.svg",
    benefits: benefitsLiberty
  },
  {
    name: "Plan Pro Liberty",
    description: "Potencia tus ventas",
    monthly: "269 USD/mes",
    annual: "2690 USD/año",
    icon: "/card-3.svg",
    benefits: benefitsPro
  },
  {
    name: "Plan Experiencia Liberty",
    description: "Escala tu empresa y domina las ventas descentralizadas",
    monthly: "697 USD/mes",
    annual: "6970 USD/año",
    icon: "/card-4.svg",
    benefits: benefitsExperiencia
  }
];

// Grilla de características por plan
export const respuestasPorPlan: Record<number, { pregunta: string; respuesta: string }[]> = {
  1: [
    { pregunta: "¿Para quien?", respuesta: "Quienes comienzan a vender por internet" },
    { pregunta: "Medios de pago", respuesta: "Criptomonedas + Medios de pagos tradicionales" },
    { pregunta: "Tienda propia", respuesta: "Para comercio electrónico." },
    { pregunta: "Agente IA", respuesta: "----" },
    { pregunta: "Catalogo productos", respuesta: "Ilimitado" },
    { pregunta: "Métricas avanzadas", respuesta: "Sabés qué productos funcionan… y cuáles no" },
    { pregunta: "Publicidad", respuesta: "Anuncios en redes sociales (Opcional)" },
    { pregunta: "Soporte", respuesta: "IA" },
    { pregunta: "Posicionamiento", respuesta: "Aparecés donde hay intención de compra" },
    { pregunta: "Reuniones de seguimiento", respuesta: "----" },
    { pregunta: "Modelo comisiones por venta", respuesta: "Alineado a tu exito" },
  ],
  2: [
    { pregunta: "¿Para quien?", respuesta: "Negocios buscando ventas diarias y crecimiento" },
    { pregunta: "Medios de pago", respuesta: "BTC, USDT, ETH, BNB, Pesos, Dólares, Euros." },
    { pregunta: "Tienda propia", respuesta: "Cero inversión técnica" },
    { pregunta: "Agente IA", respuesta: "Atiende tus clientes por vos." },
    { pregunta: "Catalogo productos", respuesta: "Escala sin pedir permiso" },
    { pregunta: "Métricas avanzadas", respuesta: "Detecta oportunidades antes que la competencia" },
    { pregunta: "Publicidad", respuesta: "Tu producto aparece prioritariamente en redes, (Opcional)" },
    { pregunta: "Soporte", respuesta: "Orientación con IA sobre tu tienda." },
    { pregunta: "Posicionamiento", respuesta: "No sos un vendedor más, sos una marca dentro del club." },
    { pregunta: "Reuniones de seguimiento", respuesta: "----" },
    { pregunta: "Modelo comisiones por venta", respuesta: "Sin letra chica ni porcentajes variables escondidos." },
  ],
  3: [
    { pregunta: "¿Para quien?", respuesta: "Líderes que buscan posicionarse digitalmente." },
    { pregunta: "Medios de pago", respuesta: "Pago blockchain, Transferencia, Débito, Crédito, Efectivo." },
    { pregunta: "Tienda propia", respuesta: "Destacada, Marca propia" },
    { pregunta: "Agente IA", respuesta: "Sin costos fijos, sin rotación de personal." },
    { pregunta: "Catalogo productos", respuesta: "Probá y optimizá sin miedo" },
    { pregunta: "Métricas avanzadas", respuesta: "Medís tu crecimiento real" },
    { pregunta: "Publicidad", respuesta: "+1000 visualizaciones diarias sobre tus anuncios." },
    { pregunta: "Soporte", respuesta: "Acompañamiento desde el día uno." },
    { pregunta: "Posicionamiento", respuesta: "Contenido optimizado para destacar." },
    { pregunta: "Reuniones de seguimiento", respuesta: "✅" },
    { pregunta: "Modelo comisiones por venta", respuesta: "Escalás y pagás menos." },
  ],
  4: [
    { pregunta: "¿Para quien?", respuesta: "Empresas que quieren dominar el comercio digital." },
    { pregunta: "Medios de pago", respuesta: "Negocia con tus clientes." },
    { pregunta: "Tienda propia", respuesta: "Gestionada y Optimizada por Ejecutivo de cuenta." },
    { pregunta: "Agente IA", respuesta: "Seguimiento y Optimización de tu Agente IA." },
    { pregunta: "Catalogo productos", respuesta: "Optimizado con IA" },
    { pregunta: "Métricas avanzadas", respuesta: "Con análisis de datos y reportes periódicos" },
    { pregunta: "Publicidad", respuesta: "Campañas publicitarias enfocadas en vender más." },
    { pregunta: "Soporte", respuesta: "Soporte humano personalizado." },
    { pregunta: "Posicionamiento", respuesta: "Recomendaciones inteligentes dentro del ecosistema Liberty." },
    { pregunta: "Reuniones de seguimiento", respuesta: "Revisión de métricas + recomendaciones claras." },
    { pregunta: "Modelo comisiones por venta", respuesta: "Un equipo entero motivado por vender." },
  ],
};
