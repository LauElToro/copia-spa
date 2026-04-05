"use client";

import React from "react";
import  PolicyPageTemplate  from "@/presentation/@shared/components/layouts/policy-page-layaut";

const PoliciesProductsPage: React.FC = () => {
const policySections = [
{
title: "¿En qué consiste?",
items: [
"Bienvenido a la comunidad de Liberty Club. Para asegurar un entorno confiable, seguro y transparente, es fundamental cumplir con las políticas al publicar productos o servicios.",
"Estas políticas son parte integral de los Términos y Condiciones y su aceptación es obligatoria para operar en Liberty Club.",
"El incumplimiento puede llevar a la suspensión de publicaciones o incluso la inhabilitación de tu cuenta."
]
},
{
title: "1. Responsabilidad y Autogestión",
items: [
"Liberty Club es un ecosistema descentralizado: no intermediamos en transacciones, envíos, pagos o garantías.",
"Cada usuario es plenamente responsable de la veracidad y legalidad de lo que publica.",
"La calidad y transparencia de la información publicada es esencial para generar confianza y buenas experiencias comerciales."
]
},
{
title: "2. Reglas sobre Publicaciones y Contenidos",
items: [
"No publicar productos con reiterados reclamos por su estado o condiciones.",
"No hacer comparaciones explícitas con otros vendedores, mencionando precios, nombres, calidades o características ajenas.",
"No usar códigos o scripts que alteren el funcionamiento de Liberty Club o recolecten datos sin consentimiento.",
"No ofrecer información engañosa o inexacta sobre el producto o servicio."
]
},
{
title: "3. Cumplimiento Impositivo y Transparencia de Precios",
items: [
"Todos los precios publicados deben incluir el IVA u otros impuestos correspondientes.",
"Cada usuario es responsable de cumplir con sus obligaciones fiscales.",
"Intentos de evasión o manipulación impositiva serán motivo de sanción."
]
},
{
title: "4. Uso Responsable de Imágenes y Medios",
items: [
"No usar imágenes que no correspondan al producto ofrecido o sin autorización.",
"No inducir a error sobre resultados, cualidades o efectos.",
"No modificar o tapar marcas originales.",
"No incluir contenido sensible, sexual o involucrar menores en situaciones inapropiadas."
]
},
{
title: "5. Restricciones de Publicación – Categorías y Contenidos Prohibidos",
items: [
"No publicar contenidos sexuales, pornografía, explotación, citas o servicios de compañía fuera del marco legal.",
"No publicar preservativos o artículos íntimos fuera de su empaque original."
]
},
{
title: "6. Sanciones y Remoción de Contenidos",
items: [
"Liberty Club remueve de inmediato cualquier contenido que infrinja estas políticas.",
"Puede restringir o bloquear cuentas según la gravedad o recurrencia de las infracciones."
]
},
{
title: "7. Imágenes y Resolución",
items: [
"Las imágenes deben reflejar fielmente el producto y tener una resolución mínima de 500 píxeles.",
"No se permite incluir logos, textos superpuestos o marcas de agua."
]
},
{
title: "8. Reglas sobre Precios",
items: [
"No publicar precios falsos, simbólicos o engañosos.",
"No exigir un precio diferente al publicado.",
"No manipular resultados de búsqueda mediante precios irregulares.",
"Sí está permitido publicar vehículos en modalidad de plan de ahorro al precio de la cuota y servicios de monta con precios acordados entre las partes."
]
},
{
title: "9. Normas sobre Stock",
items: [
"No incluir invitaciones a consultar por stock.",
"Productos usados deben tener solo una unidad disponible.",
"Es posible especificar tiempos de disponibilidad en productos nuevos (hasta 45 días)."
]
},
{
title: "10. Comunicación y Conducta en la Plataforma",
items: [
"Se exige respeto y cordialidad entre los usuarios.",
"No se permite lenguaje ofensivo, insultos, críticas personales o contenido discriminatorio.",
"Publicaciones o conductas inapropiadas pueden ser denunciadas y sancionadas."
]
},
{
title: "11. Publicaciones de Productos Originales y Autenticidad",
items: [
"Solo vendedores autorizados pueden ofrecer productos nuevos de marcas como Adidas, Nike, Lancôme, Kérastase, Kiehl’s, Ralph Lauren, entre otras."
]
},
{
title: "12. Propiedad Intelectual y Marcas",
items: [
"Está prohibido publicar productos o contenidos que infrinjan derechos de propiedad intelectual (marcas, patentes, derechos de autor, etc.)."
]
},
{
title: "13. Uso de Marcas, Derechos de Autor y Contenido de Terceros",
items: [
"No usar marcas, logos o diseños de terceros sin autorización.",
"No ofrecer copias no autorizadas de software, libros, música o películas.",
"Usar solo imágenes propias o con permisos comerciales."
]
},
{
title: "14. Productos y Servicios que Facilitan Infracciones",
items: [
"Está prohibido ofrecer productos que fomenten el acceso ilegal a contenido protegido (decodificadores, IPTV, dongles, etc.)."
]
},
{
title: "15. Modelos, Diseños Industriales, Patentes y Variedades Vegetales",
items: [
"No publicar productos que imiten o infrinjan invenciones o variedades vegetales registradas."
]
},
{
title: "16. Sanciones y Supervisión",
items: [
"Liberty Club puede anular publicaciones, restringir marcas o limitar temporalmente la visibilidad de productos sospechados de falsificación."
]
},
{
title: "17. ¿Qué hacer si tu publicación tiene una infracción?",
items: [
"Si tu publicación fue señalada, ofrecer siempre documentación de respaldo: facturas, permisos o licencias.",
"Evitar usar marcas o términos sin autorización (‘tipo’, ‘simil’, ‘inspiración’, etc.)."
]
},
{
title: "18. ¿Cómo responder a una denuncia?",
items: [
"Tendrás 4 días para presentar descargos o documentación que respalde tu publicación.",
"Liberty Club evaluará la evidencia antes de levantar o mantener la sanción."
]
},
{
title: "19. Denuncias por Propiedad Intelectual",
items: [
"Ante denuncias por falsificación, uso indebido de marca o infracción de derechos de autor, se deberá presentar documentación que acredite titularidad o autorización formal.",
"La reincidencia puede derivar en la suspensión o inhabilitación de la cuenta."
]
},
{
title: "Mensaje final",
items: [
"En Liberty Club, promovemos un comercio libre, ético y responsable.",
"Cumplir estas políticas nos permite construir una comunidad más confiable para todos."
]
}
];

return (
    <PolicyPageTemplate
      heroTitle="Políticas para Publicar Productos en Liberty Club"
      heroSubtitle="Última actualización: 21/07/2025"
      heroDescription="Para asegurar un entorno confiable, seguro y transparente para todos, es fundamental cumplir con estas políticas."
      sections={policySections}
    />
  );
};

export default PoliciesProductsPage;


