"use client";

import React from "react";
import  PolicyPageTemplate  from "@/presentation/@shared/components/layouts/policy-page-layaut";

const PrivacityPage: React.FC = () => {
const policySections = [
{
title: '1. Información que Recopilamos:',
items: [
'Datos de identidad: nombre completo, documento de identidad, fecha de nacimiento.',
'Datos de contacto: dirección de correo electrónico, número de teléfono, dirección postal.',
'Información de pago: preferencias de pago, direcciones de billeteras digitales o cuentas bancarias asociadas.',
'Datos de uso: actividad en la plataforma, transacciones realizadas y preferencias del usuario.',
'Se registra en Liberty Club.',
'Realiza transacciones dentro de la plataforma.',
'Contacta a nuestro equipo de soporte o participa en encuestas.',
'Interactúa con nuestros correos electrónicos o comunicaciones promocionales.'
]
},
{
title: '2. Uso de la Información:',
items: [
'Proporcionar y mejorar nuestros servicios.',
'Gestionar cuentas de usuario y operaciones dentro del marketplace.',
'Personalizar la experiencia del usuario en la plataforma.',
'Brindar asistencia técnica y responder consultas.',
'Cumplir con regulaciones legales y de seguridad'
],
subText: 'También podemos utilizar la información para enviar comunicaciones promocionales sobre nuevos productos, servicios o actualizaciones de la plataforma. El usuario podrá optar por no recibir estos correos electrónicos en cualquier momento.'
},
{
title: '3. Compartición de Información:',
items: [
'Cumplimiento legal: cuando sea necesario para responder a requerimientos judiciales, órdenes de autoridades competentes o normativas legales aplicables.',
'Prestadores de servicio: con empresas o proveedores de confianza que nos ayuden en la operación del marketplace (por ejemplo, procesadores de pago o servicios de seguridad informática), siempre bajo estrictas cláusulas de confidencialidad.',
'Fusiones o adquisiciones: en caso de una reestructuración empresarial, venta o fusión, la información del usuario podrá ser transferida como parte de los activos de Liberty Club'
],
subText: 'Liberty Club no vende, alquila ni transfiere la información personal de los usuarios a terceros sin su consentimiento expreso.'
},
{
title: '4. Protección de la Información',
items: [
'Liberty Club adopta medidas de seguridad administrativas, técnicas y físicas para proteger la información personal de accesos no autorizados, divulgación o alteración.',
'Sin embargo, dado que ninguna transmisión de datos en Internet es completamente segura, el usuario reconoce que Liberty Club no puede garantizar la seguridad absoluta de la información transmitida a través de la plataforma.'
]
},
{
title: '5. Derechos del Usuario',
items: [
'Acceso: conocer qué datos personales almacenamos y cómo los utilizamos.',
'Rectificación: solicitar la corrección de datos inexactos o desactualizados.',
'Eliminación: solicitar la eliminación de su información personal cuando ya no sea necesaria para los fines establecidos en esta política.',
'Oposición: rechazar el tratamiento de su información para fines comerciales o de marketing.'
],
subText: 'Para ejercer estos derechos, el usuario podrá enviar una solicitud a través de los canales de contacto indicados en la plataforma.'
},
{
title: '6. Almacenamiento y Retención de Datos',
items: [
'Cumplir con normativas legales y fiscales.',
'Resolver disputas o reclamaciones.',
'Garantizar la integridad y seguridad de la plataforma.'
],
subText: 'La información del usuario será almacenada durante el tiempo necesario para cumplir con los fines establecidos en esta política y en cumplimiento de regulaciones legales vigentes.'
},
{
title: '7. Uso de Cookies y Tecnologías de Seguimiento',
items: [
'Liberty Club puede utilizar cookies y otras tecnologías de seguimiento para mejorar la experiencia del usuario y analizar el comportamiento dentro de la plataforma.',
'Los usuarios pueden configurar su navegador para bloquear las cookies, aunque esto podría afectar algunas funcionalidades del marketplace.'
]
},
{
title: '8. Cambios en la Política de Privacidad',
items: [
'Liberty Club se reserva el derecho de modificar esta política en cualquier momento.',
'Si realizamos cambios significativos, notificaremos a los usuarios a través de nuestro sitio web o por correo electrónico.',
'El uso continuado de la plataforma después de la actualización implica la aceptación de los nuevos términos.'
]
},
{
title: '9. Contacto y Soporte',
items: [
'📩 Correo electrónico: [contacto@libertyclub.io](mailto:contacto@libertyclub.io)',
'🌐 Sitio web: [www.libertyclub.io](http://www.libertyclub.io)',
'📞 Teléfono: +543853115458'
]
},
{
title: '10. Aceptación de la Política de Privacidad',
items: [
'Al registrarse y utilizar Liberty Club, el usuario declara haber leído, entendido y aceptado esta Política de Privacidad, así como la recopilación y tratamiento de su información personal conforme a los términos aquí establecidos.',
'Liberty Club – Comercio con libertad y seguridad.'
]
}
];


return (
    <PolicyPageTemplate
      heroTitle="Política de Privacidad de Liberty Club"
      heroSubtitle="Última actualización: 21/07/2025"
      heroDescription="Protegemos tus operaciones y cuentas para que actúes con total confianza y seguridad."
      sections={policySections}
    />
  );
};

export default PrivacityPage;

